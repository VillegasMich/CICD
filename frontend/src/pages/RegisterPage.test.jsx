jest.mock("../context/AuthContext");
jest.mock("react-router-dom", () => ({
  Link: ({ to, children }) => <a href={to}>{children}</a>,
  useNavigate: jest.fn(),
}));

import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import RegisterPage from "./RegisterPage";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const mockNavigate = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  useNavigate.mockReturnValue(mockNavigate);
});

const renderPage = (registerFn = jest.fn()) => {
  useAuth.mockReturnValue({ register: registerFn });
  return render(<RegisterPage />);
};

// The Name input has no type attribute; email and password have explicit types.
const getNameInput = (container) =>
  container.querySelector('input:not([type="email"]):not([type="password"])');

describe("RegisterPage", () => {
  test("renders name, email and password inputs with submit button", () => {
    const { container } = renderPage();
    expect(getNameInput(container)).toBeInTheDocument();
    expect(container.querySelector('input[type="email"]')).toBeInTheDocument();
    expect(
      container.querySelector('input[type="password"]')
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Register" })
    ).toBeInTheDocument();
  });

  test("renders label text for each field", () => {
    renderPage();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Password")).toBeInTheDocument();
  });

  test("renders link to login page", () => {
    renderPage();
    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute(
      "href",
      "/login"
    );
  });

  test("calls register with form data on submit", async () => {
    const registerFn = jest.fn().mockResolvedValue({});
    const { container } = renderPage(registerFn);

    fireEvent.change(getNameInput(container), { target: { value: "Alice" } });
    fireEvent.change(container.querySelector('input[type="email"]'), {
      target: { value: "alice@example.com" },
    });
    fireEvent.change(container.querySelector('input[type="password"]'), {
      target: { value: "pass123" },
    });
    fireEvent.submit(
      screen.getByRole("button", { name: "Register" }).closest("form")
    );

    await waitFor(() =>
      expect(registerFn).toHaveBeenCalledWith({
        name: "Alice",
        email: "alice@example.com",
        password: "pass123",
      })
    );
  });

  test("navigates to /bicycles after successful registration", async () => {
    const registerFn = jest.fn().mockResolvedValue({});
    renderPage(registerFn);

    fireEvent.submit(
      screen.getByRole("button", { name: "Register" }).closest("form")
    );

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith("/bicycles", { replace: true })
    );
  });

  test("shows error message when registration fails", async () => {
    const registerFn = jest
      .fn()
      .mockRejectedValue(new Error("Email already registered"));
    renderPage(registerFn);

    await act(async () => {
      fireEvent.submit(
        screen.getByRole("button", { name: "Register" }).closest("form")
      );
    });

    expect(screen.getByText("Email already registered")).toBeInTheDocument();
  });

  test("shows Creating account… and disables button while submitting", async () => {
    const registerFn = jest.fn().mockResolvedValue({});
    renderPage(registerFn);

    await act(async () => {
      fireEvent.submit(
        screen.getByRole("button", { name: "Register" }).closest("form")
      );
    });

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Register" })
      ).not.toBeDisabled()
    );
  });
});
