import React from 'react';
import { NavLink } from 'react-router-dom';

const MainLayout = ({ user, setUser, children }) => {

const navLinksByRole = [
	{ label: "Dashboard",    link: "/dashboard",   roles: ["admin", "marketing", "super_admin"] },
	{ label: "Donors",       link: "/donors",      roles: ["admin", "super_admin"] },
	{ label: "Influencers",  link: "/influencers", roles: ["admin", "super_admin"] },
	{ label: "Campaigns",    link: "/campaigns",   roles: ["admin","marketing","super_admin"] },

	// ➕ Settings remains super admin only
	{ label: "Settings",     link: "/settings",    roles: ["admin", "super_admin"] }
];

return (
<div className='dashboard-layout'>
  
<nav className='sidebar'>
	<div className='logo-section'>
	  {/* Optional logo image if available in public folder */}
	  {/*<img public='Logo-with-tagline.png' alt='Logo' height='40' />*/}
	  <h2>Plasmalytics</h2>
	</div>

	<div className='sidebar-nav'>
	  {navLinksByRole.map(item =>
	    item.roles.includes(user?.role) &&
	      (<NavLink key={item.link}
	        to={item.link}
	        end className={({isActive})=>isActive ? "nav-active":""}>
	        {item.label}
	      </NavLink>)
	  )}
	</div>

	<button onClick={()=>{
	   localStorage.removeItem("plasmalytics_user");
	   setUser(null);
	   window.location.href='/'; // redirect post logout
	}} style={{
	   marginTop:'auto',
	   padding:'10px',
	   backgroundColor:'#005DAA',
	   color:'#fff',
	   border:'none',
	   width:'100%'
	}}>
	Log Out
	</button>

</nav>

<main className='dashboard-main'>{children}</main>

</div>);
};

export default MainLayout;