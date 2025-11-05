import { NavLink } from 'react-router-dom';
import type { User, UserRole } from '../types/user.types';

interface NavLinkItem {
  label: string;
  link: string;
  roles: UserRole[];
}

interface MainLayoutProps {
  user: User;
  setUser: (user: User | null) => void;
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ user, setUser, children }) => {
  const navLinksByRole: NavLinkItem[] = [
    { label: "Dashboard",    link: "/dashboard",   roles: ["admin", "marketing", "super_admin"] },
    { label: "Donors",       link: "/donors",      roles: ["admin", "super_admin"] },
    { label: "Influencers",  link: "/influencers", roles: ["admin", "super_admin"] },
    { label: "Campaigns",    link: "/campaigns",   roles: ["admin","marketing","super_admin"] },
    { label: "Settings",     link: "/settings",    roles: ["admin", "super_admin"] }
  ];

  const handleLogout = () => {
    localStorage.removeItem("plasmalytics_user");
    setUser(null);
    window.location.href = '/';
  };

  return (
    <div className='dashboard-layout'>
      
      <nav className='sidebar'>
        <div className='logo-section'>
          <h2>Plasmalytics</h2>
        </div>

        <div className='sidebar-nav'>
          {navLinksByRole.map(item =>
            item.roles.includes(user?.role) && (
              <NavLink 
                key={item.link}
                to={item.link}
                end 
                className={({isActive}) => isActive ? "nav-active" : ""}
              >
                {item.label}
              </NavLink>
            )
          )}
        </div>

        <button 
          onClick={handleLogout}
          style={{
            marginTop:'auto',
            padding:'10px',
            backgroundColor:'#005DAA',
            color:'#fff',
            border:'none',
            width:'100%'
          }}
        >
          Log Out
        </button>
      </nav>

      <main className='dashboard-main'>{children}</main>

    </div>
  );
};

export default MainLayout;

