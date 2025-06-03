import Sidenav from "./Sidenav";
import { SidebarProvider, SidebarTrigger } from "../ui/sidebar";
const NavLayout = ({children}) => {
  return (
    <>
    <div className="flex h-screen bg-background">
        
      <SidebarProvider>
        <Sidenav />
        <div className="py-3.5 bg-blue-300 h-fit">
        </div>
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* <TopNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} /> */}
          <div className="flex bg-blue-300 justify-between p-4">
            <SidebarTrigger />
            Aluri Bala Kalki
          </div>
          <main className="flex-1 overflow-y-auto bg-red-300 overflow-x-hidden p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </SidebarProvider>
      </div>
    </>
  );
};

export default NavLayout;
