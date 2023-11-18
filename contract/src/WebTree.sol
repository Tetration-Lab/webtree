// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;
import {EdOnBN254} from "solidity-ed-on-bn254/EdOnBN254V.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {ChoiceUltraVerifier} from "./choice_plonk_vk.sol";

contract WebTree is Ownable {
    address public backend;
    ChoiceUltraVerifier public choiceVerifier;

    uint256 public constant DEFAULT_STAT = 100;
    uint256 public constant DEFAULT_GLOBAL_STAT = 1337;

    event BragShouted(address indexed user, uint256 s1, uint256 s2, uint256 s3);

    enum STATUS {
        FREE,
        JOINED
    }

    struct ActionArgs {
        CipherText es1;
        CipherText es2;
        CipherText es3;
        CipherText esworld;
    }

    struct CipherText {
        EdOnBN254.Affine c1;
        EdOnBN254.Affine c2;
    }

    uint256 public sworld;
    CipherText public esworld;

    EdOnBN254.Affine public worldPublicKey;

    uint32 public epoch;
    bytes32 public epochSeed;

    uint256 public druidBalance;
    uint256 public druidSpent;
    uint256 public druidActionCount;

    struct UserStat {
        STATUS status;
        EdOnBN254.Affine publicKey;
        bytes32 commitment;
        CipherText es1;
        CipherText es2;
        CipherText es3;
        uint256 totalDonations;
        uint32 lastActionEpoch;
        uint32 totalActions;
    }
    mapping(address => UserStat) public users;

    struct Brag {
        address user;
        uint256 s1;
        uint256 s2;
        uint256 s3;
        uint32 epoch;
    }
    Brag[] public brags;

    constructor(
        address _backend,
        address owner,
        address _choiceVeifier,
        EdOnBN254.Affine memory _worldPublicKey
    ) Ownable(owner) {
        backend = _backend;
        epoch = 0;
        epochSeed = keccak256(
            abi.encodePacked(blockhash(block.number - 1), block.timestamp)
        );
        choiceVerifier = ChoiceUltraVerifier(_choiceVeifier);

        sworld = DEFAULT_GLOBAL_STAT;
        esworld = encrypt(DEFAULT_GLOBAL_STAT, _worldPublicKey);

        worldPublicKey = _worldPublicKey;
    }

    function encrypt(
        uint num,
        EdOnBN254.Affine memory elgamalPkH
    ) public view returns (CipherText memory) {
        uint y = 1;
        EdOnBN254.Affine memory m = EdOnBN254.mul(
            EdOnBN254.primeSubgroupGenerator(),
            num
        );
        EdOnBN254.Affine memory s = EdOnBN254.mul(elgamalPkH, y);
        EdOnBN254.Affine memory c1 = EdOnBN254.mul(
            EdOnBN254.primeSubgroupGenerator(),
            y
        );
        EdOnBN254.Affine memory c2 = EdOnBN254.add(m, s);
        return CipherText(c1, c2);
    }

    function druid() public view returns (uint256, uint256, uint256) {
        return (druidBalance, druidSpent, druidActionCount);
    }

    function druidAct(uint256 spend, uint256 _sworld) public {
        require(msg.sender == backend, "only backend");
        druidActionCount += 1;
        druidBalance -= spend;
        druidSpent += spend;
        CipherText memory ciphertext = encrypt(_sworld, worldPublicKey);
        esworld.c1 = EdOnBN254.add(esworld.c1, ciphertext.c1);
        esworld.c2 = EdOnBN254.add(esworld.c2, ciphertext.c2);
    }

    function endEpoch(uint worldTreeLatest) public {
        require(msg.sender == backend, "only backend");
        worldTreeLatest = worldTreeLatest; // no proof for now
        epoch += 1;
        epochSeed = keccak256(
            abi.encodePacked(blockhash(block.number - 1), block.timestamp)
        );
    }

    function join(EdOnBN254.Affine memory _publicKey) public {
        require(users[msg.sender].status == STATUS.FREE, "already joined");
        UserStat memory stat = UserStat({
            status: STATUS.JOINED,
            publicKey: _publicKey,
            commitment: 0,
            es1: encrypt(DEFAULT_STAT, _publicKey),
            es2: encrypt(DEFAULT_STAT, _publicKey),
            es3: encrypt(DEFAULT_STAT, _publicKey),
            lastActionEpoch: epoch,
            totalDonations: 0,
            totalActions: 0
        });
        users[msg.sender] = stat;
    }

    function bragsPaginated(
        uint256 start,
        uint256 count
    ) public view returns (Brag[] memory) {
        uint256 limit = brags.length > start + count
            ? count
            : brags.length - start;
        Brag[] memory result = new Brag[](limit);
        for (uint256 i = 0; i < limit; i++) {
            result[i] = brags[start + i];
        }
        return result;
    }

    function brag(uint s1, uint s2, uint s3) public {
        brags.push(Brag(msg.sender, s1, s2, s3, epoch));
        emit BragShouted(msg.sender, s1, s2, s3);
    }

    function rageQuit() public {
        require(users[msg.sender].status == STATUS.JOINED, "not joined");
        users[msg.sender].status = STATUS.FREE;
    }

    function donate() public payable {
        require(users[msg.sender].status == STATUS.JOINED, "not joined");
        users[msg.sender].totalDonations += msg.value;
        druidBalance += msg.value;
    }

    function action(ActionArgs memory act, bytes memory proof) public {
        UserStat storage stat = users[msg.sender];
        require(stat.status == STATUS.JOINED, "not joined");
        require(stat.lastActionEpoch < epoch, "already acted");
        stat.lastActionEpoch = epoch;
        stat.totalActions += 1;

        bytes32[] memory inputs = new bytes32[](22);
        inputs[0] = bytes32(stat.publicKey.x);
        inputs[1] = bytes32(stat.publicKey.y);
        inputs[2] = bytes32(worldPublicKey.x);
        inputs[3] = bytes32(worldPublicKey.y);
        inputs[4] = epochSeed;
        inputs[5] = stat.commitment;
        inputs[6] = bytes32(act.es1.c1.x);
        inputs[7] = bytes32(act.es1.c1.y);
        inputs[8] = bytes32(act.es1.c2.x);
        inputs[9] = bytes32(act.es1.c2.y);
        inputs[10] = bytes32(act.es2.c1.x);
        inputs[11] = bytes32(act.es2.c1.y);
        inputs[12] = bytes32(act.es2.c2.x);
        inputs[13] = bytes32(act.es2.c2.y);
        inputs[14] = bytes32(act.es3.c1.x);
        inputs[15] = bytes32(act.es3.c1.y);
        inputs[16] = bytes32(act.es3.c2.x);
        inputs[17] = bytes32(act.es3.c2.y);
        inputs[18] = bytes32(act.esworld.c1.x);
        inputs[19] = bytes32(act.esworld.c1.y);
        inputs[20] = bytes32(act.esworld.c2.x);
        inputs[21] = bytes32(act.esworld.c2.y);

        require(choiceVerifier.verify(proof, inputs), "Invalid proof");

        stat.es1.c1 = EdOnBN254.add(stat.es1.c1, act.es1.c1);
        stat.es1.c2 = EdOnBN254.add(stat.es1.c2, act.es1.c2);
        stat.es2.c1 = EdOnBN254.add(stat.es2.c1, act.es2.c1);
        stat.es2.c2 = EdOnBN254.add(stat.es2.c2, act.es2.c2);
        stat.es3.c1 = EdOnBN254.add(stat.es3.c1, act.es3.c1);
        stat.es3.c2 = EdOnBN254.add(stat.es3.c2, act.es3.c2);
        esworld.c1 = EdOnBN254.add(esworld.c1, act.esworld.c1);
        esworld.c2 = EdOnBN254.add(esworld.c2, act.esworld.c2);
    }
}
