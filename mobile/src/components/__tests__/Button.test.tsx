import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { Button } from "../Button";

describe("Button", () => {
  it("renders with the given title", () => {
    render(<Button title="Press Me" onPress={() => {}} />);
    expect(screen.getByText("Press Me")).toBeTruthy();
  });

  it("calls onPress when tapped", () => {
    const onPress = jest.fn();
    render(<Button title="Tap" onPress={onPress} />);
    fireEvent.press(screen.getByText("Tap"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not call onPress when disabled", () => {
    const onPress = jest.fn();
    render(<Button title="Disabled" onPress={onPress} disabled />);
    fireEvent.press(screen.getByText("Disabled"));
    expect(onPress).not.toHaveBeenCalled();
  });

  it("shows loading indicator when loading", () => {
    render(<Button title="Loading" onPress={() => {}} loading />);
    // When loading, the title text should not be visible
    expect(screen.queryByText("Loading")).toBeNull();
  });

  it("renders with secondary variant", () => {
    render(<Button title="Secondary" onPress={() => {}} variant="secondary" />);
    expect(screen.getByText("Secondary")).toBeTruthy();
  });

  it("renders with danger variant", () => {
    render(<Button title="Delete" onPress={() => {}} variant="danger" />);
    expect(screen.getByText("Delete")).toBeTruthy();
  });
});
