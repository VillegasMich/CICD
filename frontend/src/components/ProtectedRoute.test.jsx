jest.mock("../context/AuthContext");
jest.mock("react-router-dom", () => ({
  Navigate: ({ to }) => <div data-testid="navigate" data-to={to} />,
  useLocation: () => ({ pathname: "/protected" }),
}));

import { render, screen } from "@testing-library/react";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "../context/AuthContext";

const renderRoute = (props = {}) =>
  render(
    <ProtectedRoute {...props}>
      <span>secret content</span>
    </ProtectedRoute>
  );

describe("ProtectedRoute", () => {
  test("shows loading indicator while auth is loading", () => {
    useAuth.mockReturnValue({ user: null, loading: true });
    renderRoute();
    expect(screen.getByText("Loading…")).toBeInTheDocument();
    expect(screen.queryByText("secret content")).not.toBeInTheDocument();
  });

  test("redirects to /login when not authenticated", () => {
    useAuth.mockReturnValue({ user: null, loading: false });
    renderRoute();
    expect(screen.getByTestId("navigate")).toHaveAttribute("data-to", "/login");
    expect(screen.queryByText("secret content")).not.toBeInTheDocument();
  });

  test("renders children when user is authenticated", () => {
    useAuth.mockReturnValue({ user: { id: 1, role: "user" }, loading: false });
    renderRoute();
    expect(screen.getByText("secret content")).toBeInTheDocument();
  });

  test("redirects non-admin to /bicycles when requireAdmin is true", () => {
    useAuth.mockReturnValue({ user: { id: 1, role: "user" }, loading: false });
    renderRoute({ requireAdmin: true });
    expect(screen.getByTestId("navigate")).toHaveAttribute(
      "data-to",
      "/bicycles"
    );
    expect(screen.queryByText("secret content")).not.toBeInTheDocument();
  });

  test("renders children for admin when requireAdmin is true", () => {
    useAuth.mockReturnValue({ user: { id: 1, role: "admin" }, loading: false });
    renderRoute({ requireAdmin: true });
    expect(screen.getByText("secret content")).toBeInTheDocument();
  });
});
