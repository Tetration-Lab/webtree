use dep::std::ec::consts::te::baby_jubjub;
use dep::std::ec::tecurve::affine::{Point};

fn main(
    c1_x: pub [Field;3],
    c1_y: pub [Field;3],
    c2_x: pub [Field;3],
    c2_y: pub [Field;3],
    result: pub [Field;3],
    private_key: Field,
) {
    for i in 0..3{
        // elgamal decryption
        let bjj = baby_jubjub().curve;
        // c1 = (c1_x, c1_y)
        let c1s = Point::new(c1_x[i], c1_y[i]);
        // c2 = (c2_x, c2_y)
        let c2s = Point::new(c2_x[i], c2_y[i]);
        
        // s = c1 * private_key
        let s = bjj.mul(private_key,c1s);
        // m = M*G
        let m = bjj.mul(result[i], bjj.gen);
        // m + s = c2
        let m_s = bjj.add(m, s);
        if (result[i] != 0){
            assert(m_s.x == c2s.x);
            assert(m_s.y == c2s.y);
        }
    }
}

#[test]
fn test_main() {

}
