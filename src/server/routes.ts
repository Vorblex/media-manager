import {Express} from 'express'
import {asyncHandler} from './utils'
import {upload} from './controllers/upload'
import {uploader} from './uploader'
import {sendMedia} from './controllers/send-media'
import {logout} from './controllers/logout'
import {check} from './controllers/check'
import {MediaModel} from './media'
import {IAppInitialState} from '../common/interfaces'
import {provideMedia} from './controllers/provide-media'

const passport = require('passport')

// https://stackoverflow.com/a/47448486
// declare global {
//     namespace Express {
//         interface Request {
//             user?: IUserFields
//         }
//
//         interface Response {
//             locals: {
//                 initialState: IAppInitialState
//             }
//         }
//     }
// }

function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        next()
    } else {
        res.status(401).json({
            success: false,
            reason: 'unauthorized'
        })
    }
}

export function initRoutes(app: Express) {
    app.post('/api/v1/login', passport.authenticate('local'), (req, res) => {
        res.send({
            success: true,
            userName: req.user.name
        })
    })
    app.post('/api/v1/logout', logout)
    app.post('/api/v1/upload', isAuthenticated, uploader.array('uploads'), upload)
    app.get('/api/v1/check', isAuthenticated, check)
    app.get('/api/v1/media', isAuthenticated, provideMedia)
    app.get('/m/:fileName', sendMedia)
    app.get(
        '*',
        asyncHandler(async (req, res) => {
            req.session.visits = (req.session.visits || 0) + 1
            res.locals.visits = req.session.visits
            res.locals.isLoggedIn = !!req.user
            const appInitialState: IAppInitialState = {
                userMedia: res.locals.isLoggedIn
                    ? (await MediaModel.find({owner: req.user._id})).map(({tags, fileName}) => {
                          return {tags, fileName, url: `/m/${fileName}`}
                      })
                    : [],
                userName: req.user ? req.user.name : ''
            }
            res.locals.initialState = appInitialState
            res.render('default')
        })
    )
}
