jest.mock("../context/AuthContext");
jest.mock("../api/bicycles");
jest.mock("react-router-dom", () => ({
  Link: ({ to, children, ...rest }) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
}));

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import BicyclesPage from "./BicyclesPage";
import { useAuth } from "../context/AuthContext";
import {
  fetchBicycles,
  createBicycle,
  deleteBicycle,
  updateBicycle,
} from "../api/bicycles";

const BIKES = [
  { id: 1, brand: "Trek", type: "mountain", status: "available" },
  { id: 2, brand: "Giant", type: "road", status: "rented" },
];

beforeEach(() => {
  jest.clearAllMocks();
  fetchBicycles.mockResolvedValue(BIKES);
});

const renderAs = (role = "user") => {
  useAuth.mockReturnValue({ user: { id: 1, role } });
  return render(<BicyclesPage />);
};

describe("BicyclesPage — data loading", () => {
  test("shows bicycle brand and type after fetch", async () => {
    renderAs();
    expect(await screen.findByText("Trek")).toBeInTheDocument();
    expect(await screen.findByText("Giant")).toBeInTheDocument();
  });

  test("shows error when fetch fails", async () => {
    fetchBicycles.mockRejectedValue(new Error("network error"));
    renderAs();
    expect(await screen.findByText("Failed to load bicycles")).toBeInTheDocument();
  });

  test("shows empty state message when no bicycles", async () => {
    fetchBicycles.mockResolvedValue([]);
    renderAs();
    expect(await screen.findByText(/No bicycles yet/)).toBeInTheDocument();
  });
});

describe("BicyclesPage — non-admin user", () => {
  test("does not show Add bicycle button", async () => {
    renderAs("user");
    await screen.findByText("Trek");
    expect(screen.queryByRole("button", { name: /Add bicycle/ })).not.toBeInTheDocument();
  });

  test("does not show Edit or Delete buttons", async () => {
    renderAs("user");
    await screen.findByText("Trek");
    expect(screen.queryByRole("button", { name: "Edit" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Delete" })).not.toBeInTheDocument();
  });

  test("shows View link for each bicycle", async () => {
    renderAs("user");
    const links = await screen.findAllByRole("link", { name: "View" });
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute("href", "/bicycles/1");
  });
});

describe("BicyclesPage — admin user", () => {
  test("shows Add bicycle button", async () => {
    renderAs("admin");
    await screen.findByText("Trek");
    expect(screen.getByRole("button", { name: /Add bicycle/ })).toBeInTheDocument();
  });

  test("shows Edit and Delete buttons for each row", async () => {
    renderAs("admin");
    await screen.findByText("Trek");
    expect(screen.getAllByRole("button", { name: "Edit" })).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: "Delete" })).toHaveLength(2);
  });

  test("opens New bicycle modal when Add bicycle is clicked", async () => {
    renderAs("admin");
    await screen.findByText("Trek");
    fireEvent.click(screen.getByRole("button", { name: /Add bicycle/ }));
    expect(screen.getByText("New bicycle")).toBeInTheDocument();
  });

  test("opens Edit bicycle modal with pre-filled values", async () => {
    renderAs("admin");
    await screen.findByText("Trek");
    fireEvent.click(screen.getAllByRole("button", { name: "Edit" })[0]);
    expect(screen.getByText("Edit bicycle")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Trek")).toBeInTheDocument();
  });

  test("calls createBicycle and reloads on form submit", async () => {
    createBicycle.mockResolvedValue({ id: 3, brand: "Cannondale", type: "road", status: "available" });
    renderAs("admin");
    await screen.findByText("Trek");

    fireEvent.click(screen.getByRole("button", { name: /Add bicycle/ }));
    fireEvent.change(screen.getByPlaceholderText("e.g. Trek"), {
      target: { value: "Cannondale" },
    });
    fireEvent.change(screen.getByPlaceholderText("e.g. mountain"), {
      target: { value: "road" },
    });
    fireEvent.submit(screen.getByRole("button", { name: "Create" }).closest("form"));

    await waitFor(() => expect(createBicycle).toHaveBeenCalledWith({
      brand: "Cannondale",
      type: "road",
      status: "available",
    }));
  });

  test("calls deleteBicycle and reloads when confirmed", async () => {
    window.confirm = jest.fn().mockReturnValue(true);
    deleteBicycle.mockResolvedValue();
    renderAs("admin");
    await screen.findByText("Trek");

    fireEvent.click(screen.getAllByRole("button", { name: "Delete" })[0]);

    await waitFor(() => expect(deleteBicycle).toHaveBeenCalledWith(1));
  });

  test("does not call deleteBicycle when confirm is cancelled", async () => {
    window.confirm = jest.fn().mockReturnValue(false);
    renderAs("admin");
    await screen.findByText("Trek");

    fireEvent.click(screen.getAllByRole("button", { name: "Delete" })[0]);

    expect(deleteBicycle).not.toHaveBeenCalled();
  });
});
