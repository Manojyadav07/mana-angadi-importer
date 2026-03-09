import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, ShoppingBag, Package, TrendingUp, Store } from "lucide-react";

export function MerchantBottomNav() {
  const location = useLocation();

  const navItems = [
    { path: "/merchant/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/merchant/orders",    icon: ShoppingBag,     label: "Orders"    },
    { path: "/merchant/products",  icon: Package,         label: "Products"  },
    { path: "/merchant/earnings",  icon: TrendingUp,      label: "Earnings"  },
    { path: "/merchant/more",      icon: Store,           label: "Profile"   },  // ← was /merchant/profile
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-foreground/5 z-50 max-w-md mx-auto">
      <div className="flex justify-around items-center px-1 pt-2 pb-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path === "/merchant/more" && location.pathname === "/merchant/profile");
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={
                "flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl transition-all " +
                (isActive ? "text-primary" : "text-muted-foreground")
              }
            >
              <item.icon
                className={"w-5 h-5 " + (isActive ? "text-primary" : "")}
                strokeWidth={isActive ? 2 : 1.5}
              />
              <span className="text-[10px] font-semibold">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}