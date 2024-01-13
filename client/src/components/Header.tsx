import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import IUser from '../types/user.type'
import Pickleball from "../Pickleball.png"

interface Props {
    currentUser: IUser | undefined,
    logOut: () => void
}

const Header = ({currentUser, logOut} : Props) => {
    return (
    <div className='header'>
      <div className='modal fade'>
      </div>
      <div className='header-item flex-header-items'>
        <h1 id='title-text'>Pickleball Scheduler</h1>
        <img src={Pickleball} className='header-ball-style'/>
        </div>
        {currentUser ? (
          <div className="navbar-nav header-item log-item">
            <li className="nav-item">
              <a href="/login" className="nav-link" onClick={logOut}>
                Log Out
              </a>
            </li>
          </div>
        ) : (
          <div className="navbar-nav header-item log-item">
            <li className="nav-item">
              <Link to={"/login"} className="nav-link">
                Login
              </Link>
            </li>

            <li className="nav-item">
              <Link to={"/register"} className="nav-link">
                Sign Up
              </Link>
            </li>
          </div>
        )}
    </div>
    )
}

export default Header