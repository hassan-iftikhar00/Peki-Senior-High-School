// "use client";

// import React, { useState } from "react";
// import { Bell, ChevronDown, Menu, User, Settings, LogOut } from "lucide-react";
// import { useRouter } from "next/navigation";

// interface HeaderProps {
//   toggleSidebar: () => void;
// }

// export default function Header({ toggleSidebar }: HeaderProps) {
//   const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
//   const [notifications] = useState(3); // Example notification count
//   const router = useRouter();

//   const handleLogout = async () => {
//     try {
//       const response = await fetch("/api/admin/logout", {
//         method: "POST",
//         credentials: "include",
//       });

//       if (response.ok) {
//         router.push("/admin/login");
//       } else {
//         console.error("Logout failed");
//       }
//     } catch (error) {
//       console.error("Logout error:", error);
//     }
//   };

//   return (
//     <header className="header">
//       <div className="header-start">
//         <button className="sidebar-toggle not-admin" onClick={toggleSidebar}>
//           <Menu className="h-5 w-5" />
//           <span className="sr-only">Toggle sidebar</span>
//         </button>
//         <h1 className="header-title">Peki Senior High School</h1>
//       </div>

//       <div className="header-end">
//         <button className="notification-button not-admin">
//           <Bell className="h-5 w-5" />
//           {notifications > 0 && (
//             <span className="notification-badge">{notifications}</span>
//           )}
//           <span className="sr-only">View notifications</span>
//         </button>

//         <div className="profile-menu">
//           <button
//             className="profile-button not-admin"
//             onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
//           >
//             <User className="h-4 w-4" />
//             <ChevronDown className="h-4 w-4" />
//           </button>
//           {isProfileMenuOpen && (
//             <ul className="profile-dropdown">
//               <li>
//                 <a href="#profile" className="dropdown-item">
//                   <User className="h-4 w-4" />
//                   Profile
//                 </a>
//               </li>
//               <li>
//                 <a href="#settings" className="dropdown-item">
//                   <Settings className="h-4 w-4" />
//                   Settings
//                 </a>
//               </li>
//               <li>
//                 <button
//                   onClick={handleLogout}
//                   className="dropdown-item not-admin"
//                 >
//                   <LogOut className="h-4 w-4" />
//                   Log out
//                 </button>
//               </li>
//             </ul>
//           )}
//         </div>
//       </div>
//     </header>
//   );
// }

"use client";

import React, { useState } from "react";
import { Bell, ChevronDown, Menu, User, Settings, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  toggleSidebar: () => void;
}

export default function Header({ toggleSidebar }: HeaderProps) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [notifications] = useState(3); // Example notification count
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        router.push("/admin/login");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="header">
      <div className="header-start">
        <button className="sidebar-toggle not-admin" onClick={toggleSidebar}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle sidebar</span>
        </button>
        <h1 className="header-title">Peki Senior High School</h1>
      </div>

      <div className="header-end">
        <button className="notification-button not-admin">
          <Bell className="h-5 w-5" />
          {notifications > 0 && (
            <span className="notification-badge">{notifications}</span>
          )}
          <span className="sr-only">View notifications</span>
        </button>

        <div className="profile-menu">
          <button
            className="profile-button not-admin"
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
          >
            <User className="h-4 w-4" />
            <ChevronDown className="h-4 w-4" />
          </button>
          {isProfileMenuOpen && (
            <ul className="profile-dropdown">
              <li>
                <a href="#profile" className="dropdown-item">
                  <User className="h-4 w-4" />
                  Profile
                </a>
              </li>
              <li>
                <a href="#settings" className="dropdown-item">
                  <Settings className="h-4 w-4" />
                  Settings
                </a>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="dropdown-item not-admin"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>
    </header>
  );
}
