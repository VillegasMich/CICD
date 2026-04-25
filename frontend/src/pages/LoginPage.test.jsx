jest.mock("../context/AuthContext");
jest.mock("react-router-dom", () => ({
  Link: ({ to, children }) => <a href={to}>{children}</a>,
  useNavigate: jest.fn(),
  useLocation: jest.fn(),
}));

import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import LoginPage from "./LoginPage";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

const mockNavigate = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  useNavigate.mockReturnValue(mockNavigate);
  useLocation.mockReturnValue({ state: null });
});

const renderPage = (loginFn = jest.fn()) => {
  useAuth.mockReturnValue({ login: loginFn });
  return render(<LoginPage />);
};

describe("LoginPage", () => {
  test("renders email and password inputs with submit button", () => {
    const { container } = renderPage();
    expect(container.querySelector('input[type="email"]')).toBeInTheDocument();
    expect(container.querySelector('input[type="password"]')).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Log in" })).toBeInTheDocument();
  });

  test("renders label text for each field", () => {
    renderPage();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Password")).toBeInTheDocument();
  });

  test("renders link to register page", () => {
    renderPage();
    expect(screen.getByRole("link", { name: "Register" })).toHaveAttribute(
      "href",
      "/register"
    );
  });

  test("calls login with email and password on submit", async () => {
    const loginFn = jest.fn().mockResolvedValue({});
    const { container } = renderPage(loginFn);

    fireEvent.change(container.querySelector('input[type="email"]'), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(container.querySelector('input[type="password"]'), {
      target: { value: "secret123" },
    });
    fireEvent.submit(screen.getByRole("button", { name: "Log in" }).closest("form"));

    await waitFor(() =>
      expect(loginFn).toHaveBeenCalledWith({
        email: "user@example.com",
        password: "secret123",
      })
    );
  });

  test("navigates to /bicycles by default after successful login", async () => {
    const loginFn = jest.fn().mockResolvedValue({});
    renderPage(loginFn);

    fireEvent.submit(screen.getByRole("button", { name: "Log in" }).closest("form"));

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith("/bicycles", { replace: true })
    );
  });

  test("navigates to the previous location after successful login", async () => {
    useLocation.mockReturnValue({ state: { from: { pathname: "/rentals" } } });
    const loginFn = jest.fn().mockResolvedValue({});
    renderPage(loginFn);

    fireEvent.submit(screen.getByRole("button", { name: "Log in" }).closest("form"));

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith("/rentals", { replace: true })
    );
  });

  test("shows error message when login fails", async () => {
    const loginFn = jest.fn().mockRejectedValue(new Error("Invalid credentials"));
    renderPage(loginFn);

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: "Log in" }).closest("form"));
    });

    expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
  });

  test("shows Signing in… and disables button while submitting", async () => {
    const loginFn = jest.fn().mockResolvedValue({});
    renderPage(loginFn);

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: "Log in" }).closest("form"));
    });

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Log in" })).not.toBeDisabled()
    );
  });
});
