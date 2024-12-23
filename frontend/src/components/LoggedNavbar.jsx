import { useState, useContext } from 'react';
import logo from '../assets/images/logo-w.png'; // Adjust the path based on your file structure
import { Link } from 'react-router-dom';

import i1 from '../assets/DashImage/avi1.png';
import i2 from '../assets/DashImage/avi2.png';
import i3 from '../assets/DashImage/avi3.png';
import i4 from '../assets/DashImage/avi4.png';
import './LoggedNavbar.css';
import { PageContext } from '../App';
const Navbar = () => {
    const { page, setPage } = useContext(PageContext);
    const [isOpen, setIsOpen] = useState(false);
    //   const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Toggle mobile menu
    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };



    return (
        <nav className="bg-gray-800 text-white fixed z-50 " style={{ width: '100%', height: '8vh' }}>
            <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
                <div className="relative flex items-center justify-between h-16">
                    <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                        <button
                            type="button"
                            onClick={toggleMenu}
                            className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isOpen ? (
                                <svg
                                    className="block h-6 w-6"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="2"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    className="block h-6 w-6"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="2"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M4 6h16M4 12h16m-7 6h7"
                                    />
                                </svg>
                            )}
                        </button>
                    </div>
                    <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-between">
                        <div className="flex-shrink-0">
                            <a href="/" className="inline-block">
                                <img
                                    src={logo} // Use the imported image path
                                    alt="Logo"
                                    className="w-24 h-auto p-2" // Tailwind CSS classes for styling
                                />
                            </a>
                        </div>

                        {/* Full Screen..................................................................................... */}
                        <div className="hidden sm:block sm:ml-6">
                            <div className="flex pt-3 space-x-4">
                                <Link
                                    to="/"
                                    className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    Home
                                </Link>

                                <Link
                                    to="/service"
                                    className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    Service
                                </Link>
                                <Link
                                    to="/about"
                                    className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    About
                                </Link>
                                <Link
                                    to="/contact"
                                    className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    Contact
                                </Link>
                                <div>
                                    <img src='https://up.yimg.com/ib/th?id=OIP.GqGVPkLpUlSo5SmeDogUdwHaHa&pid=Api&rs=1&c=1&qlt=95&w=104&h=104' width={40} height={40} style={{ borderRadius: '50%', marginLeft: '30px' }} />
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <div
                className={`${isOpen ? 'block-a' : 'hidden-a'}`}
                id="mobile-menu"

            >

                <div onClick={() => { setPage(0); setIsOpen(false); }} className='dash-menu-set-a'><img src={i1} width={50} height={50} style={{ maxHeight: '50px' }} /><p style={{ padding: '10px' }}>Dashboard</p></div>
                <div onClick={() => { setPage(100); setIsOpen(false); }} className='dash-menu-set-a'><img src={i1} width={50} height={50} style={{ maxHeight: '50px' }} /><p style={{ padding: '10px' }}>Create Call</p></div>
                <div onClick={() => { setPage(1); setIsOpen(false); }} className='dash-menu-set-a'><img src={i2} width={50} height={50} style={{ maxHeight: '50px' }} /><p style={{ padding: '10px' }}>Call History</p></div>
                <div onClick={() => { setPage(2); setIsOpen(false); }} className='dash-menu-set-a'><img src={i3} width={50} height={50} style={{ maxHeight: '50px' }} /><p style={{ padding: '10px' }}>Subscription</p></div>
                <div onClick={() => { setPage(3); setIsOpen(false); }} className='dash-menu-set-a'><img src={i4} width={50} height={50} style={{ maxHeight: '50px' }} /><p style={{ padding: '10px' }}>Payment History</p></div>
                <div onClick={() => { setPage(4); setIsOpen(false); }} className='dash-menu-set-a'><img src={i4} width={50} height={50} style={{ maxHeight: '50px' }} /><p style={{ padding: '10px' }}>Logout</p></div>

                {/*<div className="px-2 pt-2 pb-3 space-y-1">
                    <Link
                        to="/"
                        className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                    >
                        Home
                    </Link>
                    <Link
                        to="/about"
                        className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                    >
                        About
                    </Link>
                    <Link
                        to="/service"
                        className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                    >
                        Services
                    </Link>
                    <Link
                        to="/contact"
                        className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                    >
                        Contact
                    </Link>
                    <Link
                        to="/signin"
                        className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                    >
                        Account
                    </Link>
                </div> */}
            </div>
        </nav>
    );
};

export default Navbar;
