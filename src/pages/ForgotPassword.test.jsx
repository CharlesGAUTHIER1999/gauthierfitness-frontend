/**
 * Tests de ForgotPassword : soumission, message générique de succès, erreurs de validation.
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ForgotPassword from "./ForgotPassword";
import * as authModule from "../store/auth";

jest.mock("../store/auth");

function renderPage(forgotPassword) {
    authModule.useAuth.mockReturnValue({ forgotPassword });
    return render(
        <MemoryRouter>
            <ForgotPassword />
        </MemoryRouter>
    );
}

describe("ForgotPassword", () => {
    it("shows the generic success message returned by the API after submit", async () => {
        const forgotPassword = jest.fn().mockResolvedValue({
            message: "Si un compte existe pour cet email, un lien de réinitialisation a été envoyé.",
        });
        renderPage(forgotPassword);

        fireEvent.change(screen.getByPlaceholderText("Email"), {
            target: { value: "alice@example.com" },
        });
        fireEvent.click(screen.getByRole("button", { name: /envoyer/i }));

        await waitFor(() => {
            expect(
                screen.getByText(
                    "Si un compte existe pour cet email, un lien de réinitialisation a été envoyé."
                )
            ).toBeInTheDocument();
        });

        expect(forgotPassword).toHaveBeenCalledWith("alice@example.com");
    });

    it("shows the API error message when the request fails", async () => {
        const err = new Error("throttled");
        err.response = { data: { message: "Too Many Attempts." } };
        const forgotPassword = jest.fn().mockRejectedValue(err);
        renderPage(forgotPassword);

        fireEvent.change(screen.getByPlaceholderText("Email"), {
            target: { value: "alice@example.com" },
        });
        fireEvent.click(screen.getByRole("button", { name: /envoyer/i }));

        await waitFor(() => {
            expect(screen.getByText("Too Many Attempts.")).toBeInTheDocument();
        });
    });
});
