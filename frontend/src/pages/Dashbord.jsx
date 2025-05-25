import LoggedNavbar from '../components/LoggedNavbar';
import './css/Dashbord.css';
import { useState, useContext, useEffect } from 'react';
import DashboardMain from '../components/Dashboard/DashboardMain';
import SpeechToIsl from '../components/ISL/SpeechToIsl';
import TextToIsl from '../components/ISL/TextToIsl';
import IslToSpeech from '../components/ISL/IslToSpeech';
import IslToText from '../components/ISL/IslToText';
import { PageContext } from '../App';

// Import react-icons instead of FontAwesome
import { 
  FaHome, 
  FaPhone, 
  FaCoins, 
  FaCreditCard, 
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
  FaHandsWash,
  FaFileAlt,
  FaMicrophone,
  FaCommentAlt
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Dashbord = () => {
    const { page, setPage } = useContext(PageContext);
    const navigate = useNavigate();
    
    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/signin";
    };

    const [collapsed, setCollapsed] = useState(false);
    useEffect(()=>{
        if(page === 14)
        {
            setPage(0);
            navigate('/isltext')
        }
    },[page])
    
    // Menu items configuration with react-icons
    const menuItems = [
      {
        title: "Dashboard",
        icon: FaHome,
        pageId: 0
      },
    //   {
    //     title: "Call History",
    //     icon: FaPhone,
    //     pageId: 1
    //   },
    //   {
    //     title: "Bit History",
    //     icon: FaCoins,
    //     pageId: 2
    //   },
    //   {
    //     title: "Payment History",
    //     icon: FaCreditCard,
    //     pageId: 3
    //   },
      {
        divider: true,
        title: "SL Services"
      },
      {
        title: "Speech to SL",
        icon: FaMicrophone,
        pageId: 11
      },
      {
        title: "Text to SL",
        icon: FaFileAlt,
        pageId: 12
      },
      {
        title: "SL to Speech",
        icon: FaHandsWash,
        pageId: 13
      },
      {
        title: "SL to Text",
        icon: FaCommentAlt,
        pageId: 14
      }
    ];

    const toggleSidebar = () => {
        setCollapsed(!collapsed);
    };

    return (
        <div className=' overflow-y-hidden max-h-screen '>
            <LoggedNavbar />
            <div className='pt-1'>

                <div className="dashboard-container flex min-h-screen bg-gray-100">
                    {/* Enhanced Sidebar */}
                    <div className={`sidebar pt-5 h-screen bg-white shadow-lg transition-all duration-300 mt-6 ${collapsed ? 'w-20' : 'w-64'}`}>
                        {/* Sidebar Header with Toggle */}
                        <div className="sidebar-header pb-2 justify-center flex border-b border-gray-200">
                            <button onClick={toggleSidebar} className="text-gray-500 hover:text-gray-800 transition-colors">
                                {collapsed ? <FaChevronRight size={18} /> : <FaChevronLeft size={18} />}
                            </button>
                        </div>
                        
                        {/* Sidebar Menu */}
                        <div className="sidebar-menu py-4">
                            {menuItems.map((item, index) => (
                                item.divider ? (
                                    <div key={`divider-${index}`} className={`sidebar-divider px-4 pt-6 pb-2 ${collapsed ? 'hidden' : ''}`}>
                                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{item.title}</p>
                                    </div>
                                ) : (
                                    <div 
                                        key={`item-${index}`}
                                        onClick={() => setPage(item.pageId)} 
                                        className={`menu-item flex items-center px-4 py-3 cursor-pointer hover:bg-blue-50 transition-colors ${page === item.pageId ? 'bg-blue-100 border-l-4 border-blue-500' : ''}`}
                                    >
                                        <div className="menu-icon w-10 flex justify-center">
                                            <item.icon size={20} className="text-gray-600" />
                                        </div>
                                        
                                        {!collapsed && (
                                            <span className="ml-3 text-gray-700 font-medium">{item.title}</span>
                                        )}
                                    </div>
                                )
                            ))}
                            
                            {/* Logout Button */}
                            <div className={`mt-auto ${collapsed ? 'px-2 py-4' : 'px-4 py-4'}`}>
                                {collapsed ? (
                                    <button 
                                        onClick={handleLogout}
                                        className="flex items-center justify-center w-full p-2 rounded bg-red-500 text-white hover:bg-red-600 transition-colors"
                                    >
                                        <FaSignOutAlt size={18} />
                                    </button>
                                ) : (
                                    <button 
                                        onClick={handleLogout}
                                        className="flex items-center justify-center w-full py-2 px-4 rounded bg-red-500 text-white hover:bg-red-600 transition-colors"
                                    >
                                        <FaSignOutAlt size={18} className="mr-2" />
                                        <span>Logout</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="mt-10 flex-1 p-6 overflow-auto">
                        {page === 0 ? <DashboardMain /> :
                        page === 11 ? <SpeechToIsl /> :
                        page === 12 ? <TextToIsl /> :
                        page === 13 ? <IslToSpeech /> 
                        :
                         <DashboardMain />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashbord;