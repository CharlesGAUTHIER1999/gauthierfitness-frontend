import {render, screen, fireEvent, waitFor} from "@testing-library/react";
import {MemoryRouter, Routes, Route} from "react-router-dom";
import ResetPassword from "./ResetPassword";
import * as authModule from "../store/auth";

jest.mock("../store/auth");

// Tests for ResetPassword
function renderPage(resetPassword, url = "/reset-password?token=abc123&email=alice%40example.com") {
    authModule.useAuth.mockReturnValue({resetPassword});
    return render(<MemoryRouter initialEntries={[url]}>
        <Routes>
            <Route path="/reset-password" element={<ResetPassword/>}/>
            <Route path="/login" element={<div>Login page</div>}/>
        </Routes>
    </MemoryRouter>);
}

function fillPasswords(password = "NewPassword123!", confirmation = password) {
    fireEvent.change(screen.getByPlaceholderText("Nouveau mot de passe"), {
        target: {value: password},
    });
    fireEvent.change(screen.getByPlaceholderText("Confirmer le mot de passe"), {
        target: {value: confirmation},
    });
}

describe("ResetPassword", () => {
    it("reads token and email from the URL and submits them", async () => {
        const resetPassword = jest.fn().mockResolvedValue({message: "ok"});
        renderPage(resetPassword);

        fillPasswords();
        fireEvent.click(screen.getByRole("button", {name: /réinitialiser/i}));

        await waitFor(() => {
            expect(resetPassword).toHaveBeenCalledWith({
                email: "alice@example.com",
                token: "abc123",
                password: "NewPassword123!",
                password_confirmation: "NewPassword123!",
            });
        });
    });

    it("redirects to /login on success", async () => {
        const resetPassword = jest.fn().mockResolvedValue({message: "ok"});
        renderPage(resetPassword);

        fillPasswords();
        fireEvent.click(screen.getByRole("button", {name: /réinitialiser/i}));

        await waitFor(() => {
            expect(screen.getByText("Login page")).toBeInTheDocument();
        });
    });

    it("shows an error message when the token is invalid", async () => {
        const err = new Error("invalid token");
        err.response = {data: {message: "This password reset token is invalid."}};
        const resetPassword = jest.fn().mockRejectedValue(err);
        renderPage(resetPassword);

        fillPasswords();
        fireEvent.click(screen.getByRole("button", {name: /réinitialiser/i}));

        await waitFor(() => {
            expect(screen.getByText("This password reset token is invalid.")).toBeInTheDocument();
        });
    });
});
