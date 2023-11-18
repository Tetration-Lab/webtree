// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;
import {EdOnBN254} from "solidity-ed-on-bn254/EdOnBN254V.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {ChoiceUltraVerifier} from "./choice_plonk_vk.sol";
import {DecryptUltraVerifier} from "./decrypt_plonk_vk.sol";

contract WebTree is Ownable {
    event Brag(address indexed user, uint256 s1, uint256 s2, uint256 s3);
    address public backend;
    ChoiceUltraVerifier public actionVerifier;
    DecryptUltraVerifier public decryptVerifier;

    constructor(
        address _backend,
        address owner,
        address actionVeifier,
        address decryptVerifier,
        EdOnBN254.Affine memory worldElgamalPkH
    ) Ownable(owner) {
        backend = _backend;
        epochNo = 0;
        epochSeed = block.timestamp;
        actionVerifier = ChoiceUltraVerifier(actionVeifier);
        decryptVerifier = DecryptUltraVerifier(decryptVerifier);
        worldTreeLatest = 1337;
        worldTreeEncrypted = encrypt(1337, worldElgamalPkH);
        worldElgamalPkH = worldElgamalPkH;
    }

    enum STATUS {
        FREE,
        JOINED
    }

    struct ActionArgs {
        ECypher es1;
        ECypher es2;
        ECypher es3;
        ECypher esworld;
        uint[4] randomness;
    }

    struct ECypher {
        EdOnBN254.Affine c1;
        EdOnBN254.Affine c2;
    }

    uint256 public worldTreeLatest;
    ECypher public worldTreeEncrypted;
    uint256 public druitBalance;
    EdOnBN254.Affine public worldElgamalPkH;
    uint256 public epochNo;
    uint256 public epochSeed;

    struct UserStat {
        STATUS status;
        EdOnBN254.Affine elgamalPkH;
        ECypher es1;
        ECypher es2;
        ECypher es3;
        uint256 lastActionEpoch;
        bytes32 commit;
    }

    mapping(address => UserStat) users;

    function encrypt(
        uint num,
        EdOnBN254.Affine memory elgamalPkH
    ) public view returns (ECypher memory) {
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
        return ECypher(c1, c2);
    }

    function endEpoch(uint worldTreeLatest) public {
        require(msg.sender == backend, "only backend");
        worldTreeLatest = worldTreeLatest; // no proof for now
        epochNo += 1;
        epochSeed = block.timestamp;
    }

    function join(EdOnBN254.Affine memory _elgamalPkH) public payable {
        require(users[msg.sender].status == STATUS.FREE, "already joined");
        users[msg.sender].status = STATUS.JOINED;
        users[msg.sender].elgamalPkH = _elgamalPkH;
        druitBalance += msg.value;
        users[msg.sender].es1 = encrypt(100, _elgamalPkH);
        users[msg.sender].es2 = encrypt(100, _elgamalPkH);
        users[msg.sender].es3 = encrypt(100, _elgamalPkH);
        users[msg.sender].lastActionEpoch = 0;
    }

    function brag(uint s1, uint s2, uint s3, bytes calldata proof) public {
        emit Brag(msg.sender, s1, s2, s3);
    }

    function rageQuit() public {
        require(users[msg.sender].status == STATUS.JOINED, "not joined");
        users[msg.sender].status = STATUS.FREE;
    }

    function action(ActionArgs memory act, bytes memory proof) public {
        require(users[msg.sender].status == STATUS.JOINED, "not joined");
        require(users[msg.sender].lastActionEpoch < epochNo, "already acted");
        users[msg.sender].lastActionEpoch = epochNo;
    }
}
