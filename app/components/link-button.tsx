import Link from "next/link";

export default function LinkButton({href, children}: {href: string, children?: React.ReactNode}){
    return(
        <Link className="bg-black p-2 text-white rounded-md w-fit flex" href={href}>
            {children}
        </Link>
    )
}