import type React from "react";
import { Button, buttonVariants } from "./ui/button";

export default function Link({href, variant, children}: {href: string, children: React.ReactNode, variant?: "ghost"}) {
    return (

        <Button asChild variant={variant}>  
            <a href={href}>
                {children}
            </a>
        </Button>
    )
}