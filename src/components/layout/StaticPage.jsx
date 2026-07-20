import {useEffect} from "react";

// Generic static page layout
export default function StaticPage({title, subtitle, children}) {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        if (title) document.title = `${title} - GauthierFitness`;
    }, [title]);

    return (<div className="static-page">
        <header className="static-page__header">
            <h1>{title}</h1>
            {subtitle && <p className="static-page__subtitle">{subtitle}</p>}
        </header>
        <div className="static-page__content">{children}</div>
    </div>);
}

// Placeholder page
export function ComingSoon({title, message}) {
    return (<StaticPage title={title}>
        <div className="coming-soon">
            <span className="coming-soon__badge">En cours de réalisation</span>
            <h2>Cette page arrive bientôt</h2>
            <p>{message}</p>
        </div>
    </StaticPage>);
}
