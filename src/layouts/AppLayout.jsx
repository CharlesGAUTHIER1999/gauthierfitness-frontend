import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

// Public site shell: header on top, page content passed as children below, footer at the bottom.
export default function AppLayout({children}) {
    return (
        <>
            <Header/>
            <main>{children}</main>
            <Footer/>
        </>
    );
}