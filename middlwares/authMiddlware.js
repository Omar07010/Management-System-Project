// protect routes middleware function
export const protectRoute = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login')
    }
    next()
}

// guest router middleware function
export const guestRoute = (req, res, next) => {
    if (req.session.user) {
        return res.redirect('/profile')
    }
    next()
}
