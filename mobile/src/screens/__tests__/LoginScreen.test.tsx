import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import LoginScreen from "../LoginScreen";

// Mock navigation and auth
jest.mock("../../lib/auth", () => ({
  useAuth: () => ({
    login: jest.fn(),
    user: null,
    token: null,
    isLoading: false,
    register: jest.fn(),
    logout: jest.fn(),
    refreshUser: jest.fn(),
  }),
}));

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
}));

describe("LoginScreen", () => {
  it("renders email and password inputs", () => {
    render(<LoginScreen />);
    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeTruthy();
    expect(screen.getByPlaceholderText(/your password/i)).toBeTruthy();
  });

  it("renders the sign in button", () => {
    render(<LoginScreen />);
    expect(screen.getByText("Sign In")).toBeTruthy();
  });

  it("renders the sign up link", () => {
    render(<LoginScreen />);
    expect(screen.getByText("Sign Up")).toBeTruthy();
  });

  it("allows typing into email and password fields", () => {
    render(<LoginScreen />);
    const emailInput = screen.getByPlaceholderText(/you@example.com/i);
    const passwordInput = screen.getByPlaceholderText(/your password/i);

    fireEvent.changeText(emailInput, "test@example.com");
    fireEvent.changeText(passwordInput, "password123");

    expect(emailInput.props.value).toBe("test@example.com");
    expect(passwordInput.props.value).toBe("password123");
  });
});
