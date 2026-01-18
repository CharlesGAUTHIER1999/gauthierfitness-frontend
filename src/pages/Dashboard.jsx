import { useAuth } from "../store/auth";

export default function Dashboard() {
    const user = useAuth((s) => s.user);

    return (
        <div>
            <h1>Bienvenue {user?.firstname} 👋</h1>
            <p>Vous êtes connecté à votre espace personnel.</p>
        </div>
    );
}
