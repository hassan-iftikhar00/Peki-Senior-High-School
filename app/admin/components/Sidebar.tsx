// import React from "react";
// import Image from "next/image";
// import {
//   Activity,
//   BookOpen,
//   FileText,
//   Home,
//   LogOut,
//   School,
//   Settings,
//   User,
//   Users,
// } from "lucide-react";

// interface SidebarProps {
//   activePage: string;
//   setActivePage: (page: string) => void;
//   isOpen: boolean;
//   toggleSidebar: () => void;
// }

// export default function Sidebar({
//   activePage,
//   setActivePage,
//   isOpen,
//   toggleSidebar,
// }: SidebarProps) {
//   const menuItems = [
//     { id: "dashboard", label: "Dashboard", icon: Home },
//     { id: "students", label: "Students", icon: Users },
//     { id: "school-settings", label: "School Settings", icon: Settings },
//     { id: "actions", label: "Actions", icon: Activity },
//     { id: "programmes", label: "Programmes", icon: BookOpen },
//     { id: "class", label: "Classes", icon: School },
//     { id: "houses", label: "Houses", icon: Home },
//     { id: "logs", label: "Logs", icon: FileText },
//     {
//       id: "admission-document",
//       label: "Admission Documents",
//       icon: FileText,
//     },
//     { id: "users", label: "Users", icon: User },
//   ];

//   return (
//     <aside className={`sidebar ${isOpen ? "" : "closed"}`}>
//       <div className="sidebar-header">
//         <div className="logo-container">
//           <Image
//             src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/PO_logo_transparent-svdlDCdbELJnvXtecztMuFAiI1BudT.png"
//             alt="Packets Out LLC Logo"
//             width={40}
//             height={40}
//             className="sidebar-logo"
//           />
//           <div className="logo-text">
//             <h1>Packets Out LLC</h1>
//             <p>Smart Systems</p>
//           </div>
//         </div>
//       </div>

//       <nav className="sidebar-nav">
//         <ul>
//           {menuItems.map((item) => {
//             const Icon = item.icon;
//             return (
//               <li key={item.id}>
//                 <button
//                   className={`nav-item not-admin ${
//                     activePage === item.id ? "active" : ""
//                   }`}
//                   onClick={() => setActivePage(item.id)}
//                 >
//                   <Icon className="nav-icon" />
//                   <span>{item.label}</span>
//                 </button>
//               </li>
//             );
//           })}
//         </ul>
//       </nav>

//       <button className="logout-button not-admin">
//         <LogOut className="nav-icon" />
//         <span>Logout</span>
//       </button>
//     </aside>
//   );
// }

import React from "react";
import Image from "next/image";
import {
  Activity,
  BookOpen,
  FileText,
  Home,
  LogOut,
  School,
  Settings,
  User,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({
  activePage,
  setActivePage,
  isOpen,
  toggleSidebar,
}: SidebarProps) {
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

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "students", label: "Students", icon: Users },
    { id: "school-settings", label: "School Settings", icon: Settings },
    { id: "actions", label: "Actions", icon: Activity },
    { id: "programmes", label: "Programmes", icon: BookOpen },
    { id: "class", label: "Classes", icon: School },
    { id: "houses", label: "Houses", icon: Home },
    { id: "logs", label: "Logs", icon: FileText },
    {
      id: "admission-document",
      label: "Admission Documents",
      icon: FileText,
    },
    { id: "users", label: "Users", icon: User },
  ];

  return (
    <aside className={`sidebar ${isOpen ? "" : "closed"}`}>
      <div className="sidebar-header">
        <div className="logo-container">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/PO_logo_transparent-svdlDCdbELJnvXtecztMuFAiI1BudT.png"
            alt="Packets Out LLC Logo"
            width={40}
            height={40}
            className="sidebar-logo"
          />
          <div className="logo-text">
            <h1>Packets Out LLC</h1>
            <p>Smart Systems</p>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  className={`nav-item not-admin ${
                    activePage === item.id ? "active" : ""
                  }`}
                  onClick={() => setActivePage(item.id)}
                >
                  <Icon className="nav-icon" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <button className="logout-button not-admin" onClick={handleLogout}>
        <LogOut className="nav-icon" />
        <span>Logout</span>
      </button>
    </aside>
  );
}
