use dep::std::ec::consts::te::baby_jubjub;
use dep::std::ec::tecurve::affine::{Point};
use dep::std::println;
use dep::std::hash::mimc::{mimc_bn254};

unconstrained fn elgamal_encrypt(elgamal_randomness:Field, msg: Field, elgamal_pk:Point) -> (Point, Point) {
    let bjj = baby_jubjub().curve; 
    let c0 = bjj.mul(elgamal_randomness, bjj.gen);
    let c1 = bjj.add(bjj.mul(msg, bjj.gen), bjj.mul(elgamal_randomness, elgamal_pk));
    (c0, c1)
} 

fn elgamal_decrypt_check( 
    c1_x: Field,
    c1_y: Field,
    c2_x: Field,
    c2_y: Field,
    result: Field,
    private_key: Field){
        // elgamal decryption
        let bjj = baby_jubjub().curve;
        // c1 = (c1_x, c1_y)
        let c1s = Point::new(c1_x, c1_y);
        // c2 = (c2_x, c2_y)
        let c2s = Point::new(c2_x, c2_y);
        
        // s = c1 * private_key
        let s = bjj.mul(private_key,c1s);
        // m = M*G
        let m = bjj.mul(result, bjj.gen);
        // m + s = c2
        let m_s = bjj.add(m, s);
        assert(m_s.x == c2s.x);
        assert(m_s.y == c2s.y);
}

fn main(
    elgamal_pk: pub Point,
    global_elgamal_pk: pub Point,
    elgamal_randomness: [Field; 4],
    public_seed: pub Field,
    public_commitment: pub Field,
    preimage: Field,
    private_choices: [Field;5],
    private_key: Field,
) -> pub [(Point, Point); 4] {

    let bjj = baby_jubjub().curve;

    // ensure private hash is correct
    let hash = mimc_bn254([preimage]);
    assert(hash == public_commitment);

    let mut stat_0 = 0;
    let mut stat_1 = 0;
    let mut stat_2 = 0;
    let mut stat_3 = 0;
    
    let mut this_rand = mimc_bn254([preimage, public_seed]);
    let r = this_rand.to_le_bytes(32);
    for i in 0..5 {
        let e1 = r[i*5];
        let e2 = r[i*5 + 1];
        let e3 = r[i*5 + 2];
        
        assert((private_choices[i] == 0) | (private_choices[i] == 1));
        // total sum = 1. s0-3 = rand [-3, 4]. s4 = 1 - (s0-3) 
        stat_0 += (4 - ((e1 & 7) as Field)) * (1 - 2 * private_choices[i]);
        stat_1 += (4 - ((e2 & 7) as Field)) * (1 - 2 * private_choices[i]);
        stat_2 += (4 - ((e3 & 7) as Field)) * (1 - 2 * private_choices[i]);
        stat_3 += (((e1 & 7) + (e2 & 7) + (e3 & 7)) as Field - 11) * (1 - 2 * private_choices[i]);   
    }

    let mut stats = [(Point::zero(), Point::zero()); 4];

    stats[0] = elgamal_encrypt(elgamal_randomness[0], stat_0, elgamal_pk);
    elgamal_decrypt_check(stats[0].0.x, stats[0].0.y, stats[0].1.x, stats[0].1.y, stat_0, private_key);

    stats[1] = elgamal_encrypt(elgamal_randomness[1], stat_1, elgamal_pk);
    elgamal_decrypt_check(stats[1].0.x, stats[1].0.y, stats[1].1.x, stats[1].1.y, stat_1, private_key);

    stats[2] = elgamal_encrypt(elgamal_randomness[2], stat_2, elgamal_pk);
    elgamal_decrypt_check(stats[2].0.x, stats[2].0.y, stats[2].1.x, stats[2].1.y, stat_2, private_key);

    let c0 = bjj.mul(elgamal_randomness[3], bjj.gen);
    let c1 = bjj.add(bjj.mul(stat_3, bjj.gen), bjj.mul(elgamal_randomness[3], global_elgamal_pk));
    stats[3] = (c0, c1);

    stats
}

#[test]
fn test() {
    let bjj = baby_jubjub().curve;
    let pk = bjj.mul(69, bjj.gen);
    println(pk);
    let gpk = bjj.mul(420, bjj.gen);
    println(gpk);
    let r = [1,2,3,4];
    let seed = 1337;
    let preimage = 7331;
    let commitment = mimc_bn254([preimage]);
    println(commitment);
    let choices = [0,1,1,0,1];
    let _ = main(pk, gpk, r, seed, commitment, preimage, choices,69);
}