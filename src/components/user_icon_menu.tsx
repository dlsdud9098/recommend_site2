import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { Button } from "./ui/button";
import { User, Link, Settings, LogOut } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { useAuth } from "@/lib/auth-context";


export default function UserIconMenu() {
    const { user, logout } = useAuth()


    

    
    // <DropdownMenu>
    //     <DropdownMenuTrigger asChild>
    //         <Button variant="ghost" className="relative h-8 w-8 rounded-full">
    //         <Avatar className="h-8 w-8">
    //             <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
    //             <AvatarFallback>
    //             <User className="h-4 w-4" />
    //             </AvatarFallback>
    //         </Avatar>
    //         </Button>
    //     </DropdownMenuTrigger>
    //     <DropdownMenuContent className="w-56" align="end" forceMount>
    //         <div className="flex items-center justify-start gap-2 p-2">
    //         <div className="flex flex-col space-y-1 leading-none">
    //             <p className="font-medium">{user.name}</p>
    //             <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
    //         </div>
    //         </div>
    //         <DropdownMenuSeparator />
    //         <DropdownMenuItem asChild>
    //         <Link href="/profile" className="w-full cursor-pointer">
    //             <User className="mr-2 h-4 w-4" />내 정보
    //         </Link>
    //         </DropdownMenuItem>
    //         <DropdownMenuItem onClick={() => setShowSettings(true)} className="cursor-pointer">
    //         <Settings className="mr-2 h-4 w-4" />
    //         설정
    //         </DropdownMenuItem>
    //         <DropdownMenuSeparator />
    //         <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
    //         <LogOut className="mr-2 h-4 w-4" />
    //         로그아웃
    //         </DropdownMenuItem>
    //     </DropdownMenuContent>
    // </DropdownMenu>
}
