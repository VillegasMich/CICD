jest.mock("../api/auth");
jest.mock("../api/client", () => ({ configureApi: jest.fn() }));

import { renderHook, act, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "./AuthContext";
import * as authApi from "../api/auth";

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

describe("useAuth", () => {
  test("throws when used outside AuthProvider", () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      "useAuth must be used within AuthProvider"
    );
  });
});

describe("AuthProvider — no stored token", () => {
  test("starts with null user and token, loading resolves to false", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });
});

describe("AuthProvider — with stored token", () => {
  beforeEach(() => {
    localStorage.setItem("auth_token", "stored-token");
    authApi.fetchMe.mockResolvedValue({ id: 1, email: "a@b.com", role: "user" });
  });

  test("fetches current user on boot when token exists", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(authApi.fetchMe).toHaveBeenCalled();
    expect(result.current.user).toEqual({ id: 1, email: "a@b.com", role: "user" });
  });

  test("clears user and token on logout", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.logout());

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });

  test("clears state when boot fetchMe fails", async () => {
    authApi.fetchMe.mockRejectedValue(new Error("401"));
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });
});

describe("AuthProvider — login", () => {
  test("sets token and user after successful login", async () => {
    authApi.fetchMe.mockResolvedValue(null);
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    authApi.login.mockResolvedValue({ access_token: "new-tok" });
    authApi.fetchMe.mockResolvedValue({ id: 2, email: "b@c.com", role: "admin" });

    await act(async () => {
      await result.current.login({ email: "b@c.com", password: "pass" });
    });

    expect(result.current.token).toBe("new-tok");
    expect(result.current.user).toEqual({ id: 2, email: "b@c.com", role: "admin" });
  });
});
