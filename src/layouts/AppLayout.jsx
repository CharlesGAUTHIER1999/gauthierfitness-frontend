import Header from "../components/layout/Header";

// Public site shell: header on top, page content passed as children below.
export default function AppLayout({children}) {
    return (
        <>
            <Header/>
            <main>{children}</main>
        </>
    );
}