jest.mock("../api/rentals");
jest.mock("react-router-dom", () => ({
  Link: ({ to, children }) => <a href={to}>{children}</a>,
}));

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RentalsPage from "./RentalsPage";
import { fetchRentals, completeRental } from "../api/rentals";

const RENTALS = [
  {
    id: 1,
    bicycle_id: 3,
    user_id: 2,
    start_time: "2024-01-15T10:00:00Z",
    end_time: null,
    status: "active",
  },
  {
    id: 2,
    bicycle_id: 4,
    user_id: 2,
    start_time: "2024-01-10T09:00:00Z",
    end_time: "2024-01-10T11:00:00Z",
    status: "completed",
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  fetchRentals.mockResolvedValue(RENTALS);
});

describe("RentalsPage — data loading", () => {
  test("renders rental rows after fetch", async () => {
    render(<RentalsPage />);
    expect(await screen.findAllByText("#1")).not.toHaveLength(0);
    expect(screen.getAllByText("#2")).not.toHaveLength(0);
  });

  test("shows empty state when there are no rentals", async () => {
    fetchRentals.mockResolvedValue([]);
    render(<RentalsPage />);
    expect(
      await screen.findByText(/No rentals yet/)
    ).toBeInTheDocument();
  });

  test("shows error when fetch fails", async () => {
    fetchRentals.mockRejectedValue(new Error("network error"));
    render(<RentalsPage />);
    expect(await screen.findByText("Failed to load rentals")).toBeInTheDocument();
  });
});

describe("RentalsPage — rental actions", () => {
  test("shows Complete button only for active rentals", async () => {
    render(<RentalsPage />);
    await screen.findByText("#1");
    const completeButtons = screen.getAllByRole("button", { name: "Complete" });
    expect(completeButtons).toHaveLength(1);
  });

  test("calls completeRental with the rental id when confirmed", async () => {
    window.confirm = jest.fn().mockReturnValue(true);
    completeRental.mockResolvedValue({ id: 1, status: "completed" });
    render(<RentalsPage />);

    fireEvent.click(await screen.findByRole("button", { name: "Complete" }));

    await waitFor(() => expect(completeRental).toHaveBeenCalledWith(1));
  });

  test("does not call completeRental when confirm is cancelled", async () => {
    window.confirm = jest.fn().mockReturnValue(false);
    render(<RentalsPage />);

    fireEvent.click(await screen.findByRole("button", { name: "Complete" }));

    expect(completeRental).not.toHaveBeenCalled();
  });

  test("shows error when completeRental fails", async () => {
    window.confirm = jest.fn().mockReturnValue(true);
    completeRental.mockRejectedValue(new Error("server error"));
    render(<RentalsPage />);

    fireEvent.click(await screen.findByRole("button", { name: "Complete" }));

    expect(await screen.findByText("Failed to complete rental")).toBeInTheDocument();
  });
});

describe("RentalsPage — date formatting", () => {
  test("displays formatted start date for active rental", async () => {
    render(<RentalsPage />);
    await screen.findByText("#1");
    // toLocaleString output varies by locale; just verify the raw "—" placeholder isn't shown for start_time
    const cells = screen.getAllByRole("cell");
    const startCell = cells.find((c) => c.textContent.match(/2024|Jan/));
    expect(startCell).toBeTruthy();
  });

  test("shows — for null end_time", async () => {
    render(<RentalsPage />);
    await screen.findByText("#1");
    const dashes = screen.getAllByText("—");
    expect(dashes.length).toBeGreaterThanOrEqual(1);
  });
});
