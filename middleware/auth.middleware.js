export const isLoggedIn = async (req, res, next) => {
    try {
        console.log(req.cookies)
        const token = req.cookies?.token
        console.log('Token found')
        if(!token){
            return res.status(401).json({
                success: true,
                message: "Please logIn frist"
            })
        }
    } catch (error) {
        
    }
    next()
}