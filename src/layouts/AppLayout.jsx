import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

// Public site shell
export default function AppLayout({children}) {
    return (<>
        <Header/>
        <main>{children}</main>
        <Footer/>
    </>);
}