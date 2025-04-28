import { Bookshelf } from "@/components/bookshelf";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-8 lg:p-12">
       {/* Development Link to Login Page */}
       <div className="absolute top-4 right-4">
         <Button asChild variant="outline">
           <Link href="/login">Login</Link>
         </Button>
       </div>
      <Bookshelf />
    </main>
  );
}
