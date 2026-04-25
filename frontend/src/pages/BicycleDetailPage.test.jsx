jest.mock("../context/AuthContext");
jest.mock("../api/bicycles");
jest.mock("../api/rentals");
jest.mock("react-router-dom", () => ({
  Link: ({ to, children }) => <a href={to}>{children}</a>,
  useNavigate: jest.fn(),
  useParams: jest.fn(),
}));

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import BicycleDetailPage from "./BicycleDetailPage";
import { useAuth } from "../context/AuthContext";
import { fetchBicycle } from "../api/bicycles";
import { createRental } from "../api/rentals";
import { useNavigate, useParams } from "react-router-dom";

const mockNavigate = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  useNavigate.mockReturnValue(mockNavigate);
  useParams.mockReturnValue({ id: "5" });
  useAuth.mockReturnValue({ user: { id: 1, name: "Alice" } });
});

describe("BicycleDetailPage — loading / error states", () => {
  test("shows loading indicator before data arrives", () => {
    fetchBicycle.mockReturnValue(new Promise(() => {}));
    render(<BicycleDetailPage />);
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  test("shows error when fetch fails", async () => {
    fetchBicycle.mockRejectedValue(new Error("not found"));
    render(<BicycleDetailPage />);
    expect(await screen.findByText("Failed to load bicycle")).toBeInTheDocument();
  });
});

describe("BicycleDetailPage — bicycle details", () => {
  const bike = { id: 5, brand: "Trek", type: "mountain", status: "available" };

  beforeEach(() => fetchBicycle.mockResolvedValue(bike));

  test("displays brand, type and status", async () => {
    render(<BicycleDetailPage />);
    expect(await screen.findByText("Trek")).toBeInTheDocument();
    expect(screen.getByText("mountain")).toBeInTheDocument();
    expect(screen.getByText("available")).toBeInTheDocument();
  });

  test("shows Rent button when bicycle is available", async () => {
    render(<BicycleDetailPage />);
    expect(
      await screen.findByRole("button", { name: "Rent this bicycle" })
    ).toBeInTheDocument();
  });

  test("does not show Rent button when bicycle is rented", async () => {
    fetchBicycle.mockResolvedValue({ ...bike, status: "rented" });
    render(<BicycleDetailPage />);
    await screen.findByText("rented");
    expect(
      screen.queryByRole("button", { name: "Rent this bicycle" })
    ).not.toBeInTheDocument();
  });

  test("opens rental modal with user name when Rent button is clicked", async () => {
    render(<BicycleDetailPage />);
    fireEvent.click(await screen.findByRole("button", { name: "Rent this bicycle" }));
    expect(screen.getByText(/Renting as/)).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  test("calls createRental and navigates to /rentals on confirm", async () => {
    createRental.mockResolvedValue({ id: 10 });
    render(<BicycleDetailPage />);
    fireEvent.click(await screen.findByRole("button", { name: "Rent this bicycle" }));
    fireEvent.submit(
      screen.getByRole("button", { name: "Confirm rental" }).closest("form")
    );

    await waitFor(() =>
      expect(createRental).toHaveBeenCalledWith({ bicycle_id: 5 })
    );
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/rentals"));
  });

  test("shows error in modal when createRental fails", async () => {
    createRental.mockRejectedValue(new Error("unavailable"));
    render(<BicycleDetailPage />);
    fireEvent.click(await screen.findByRole("button", { name: "Rent this bicycle" }));
    fireEvent.submit(
      screen.getByRole("button", { name: "Confirm rental" }).closest("form")
    );

    expect(await screen.findByText("Failed to start rental")).toBeInTheDocument();
  });
});
