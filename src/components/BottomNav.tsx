import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, BookOpen, ClipboardList, User, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isGuest } = useAuth();
  
  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/study", icon: BookOpen, label: "Study" },
    { path: "/tests", icon: ClipboardList, label: "Tests" },
    { path: "/generate", icon: Sparkles, label: "AI" },
    { path: "/profile", icon: User, label: isGuest ? "Sign Up" : "Profile" },
  ];

  // Check if current path starts with any nav item path
  const isNavActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex justify-around py-3">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = isNavActive(path);
          const handleClick = (e: React.MouseEvent) => {
            if (path === "/profile" && isGuest) {
              e.preventDefault();
              navigate("/auth");
            }
          };
          
          return (
            <Link
              key={path}
              to={path}
              onClick={handleClick}
              className={`flex flex-col items-center ${
                isActive ? "text-blue-600" : "text-gray-400"
              }`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
