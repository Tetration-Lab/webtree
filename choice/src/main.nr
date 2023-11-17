use dep::std::ec::consts::te::baby_jubjub;
use dep::std::ec::tecurve::affine::{Point};
use dep::std::println;
use dep::std::hash::mimc::{mimc_bn254};

fn main(
    elgamal_pk: pub Point,
    global_elgamal_pk: pub Point,
    elgamal_randomness: [Field; 4],
    public_seed: pub Field,
    public_commitment: pub Field,
    preimage: Field,
    private_choices: [Field;5],
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
    for i in 0..5 {
        let r = this_rand.to_le_bytes(4);
        this_rand /= 1024;
        let e1 = r[0];
        let e2 = r[1];
        let p1 = r[2];
        let p2 = r[3];

        assert((private_choices[i] == 0) | (private_choices[i] == 1));
        // [select if effect stat e] [random [-4, 3]] [pick as is or flip]
        stat_0 += ((e1 & 3 == 0) as Field) * (3 - ((p1 & 7) as Field)) * (1 - 2 * private_choices[i]);
        stat_1 += ((e1 & 3 == 1) as Field) * (3 - ((p1 & 7) as Field)) * (1 - 2 * private_choices[i]);
        stat_2 += ((e1 & 3 == 2) as Field) * (3 - ((p1 & 7) as Field)) * (1 - 2 * private_choices[i]);
        stat_3 += ((e1 & 3 == 3) as Field) * (3 - ((p1 & 7) as Field)) * (1 - 2 * private_choices[i]);

        stat_0 += ((e2 & 3 == 0) as Field) * (3 - ((p2 & 7) as Field)) * (1 - 2 * private_choices[i]);
        stat_1 += ((e2 & 3 == 1) as Field) * (3 - ((p2 & 7) as Field)) * (1 - 2 * private_choices[i]);
        stat_2 += ((e2 & 3 == 2) as Field) * (3 - ((p2 & 7) as Field)) * (1 - 2 * private_choices[i]);
        stat_3 += ((e2 & 3 == 3) as Field) * (3 - ((p2 & 7) as Field)) * (1 - 2 * private_choices[i]);
    }

    let mut stats = [(Point::zero(), Point::zero()); 4];

    let c0 = bjj.mul(elgamal_randomness[0], bjj.gen);
    let c1 = bjj.add(bjj.mul(stat_0, bjj.gen), bjj.mul(elgamal_randomness[0], elgamal_pk));
    stats[0] = (c0, c1);

    let c0 = bjj.mul(elgamal_randomness[1], bjj.gen);
    let c1 = bjj.add(bjj.mul(stat_1, bjj.gen), bjj.mul(elgamal_randomness[1], elgamal_pk));
    stats[1] = (c0, c1);

    let c0 = bjj.mul(elgamal_randomness[2], bjj.gen);
    let c1 = bjj.add(bjj.mul(stat_2, bjj.gen), bjj.mul(elgamal_randomness[2], elgamal_pk));
    stats[2] = (c0, c1);

    let c0 = bjj.mul(elgamal_randomness[3], bjj.gen);
    let c1 = bjj.add(bjj.mul(stat_3, bjj.gen), bjj.mul(elgamal_randomness[3], global_elgamal_pk));
    stats[3] = (c0, c1);

    stats
}

#[test]
fn test() {
}