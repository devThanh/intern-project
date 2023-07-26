import bcrypt from 'bcrypt';
const saltRounds = 10;
export default{
    encode: async(password: string)=>{
        const encodePassword = await bcrypt.hash(password, saltRounds)
        return encodePassword
    },

    decode: async(password: string, passwordUser: string)=>{
        const decodePassword = bcrypt.compareSync(password, passwordUser);
        return decodePassword
    }
}