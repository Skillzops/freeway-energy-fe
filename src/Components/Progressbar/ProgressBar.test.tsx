import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProgressBar from './ProgressBar';

function getProgressBarColorClass(percentage: number) {
  if (percentage >= 90 && percentage <= 100) return 'bg-green-300';
  if (percentage >= 60 && percentage < 80) return 'bg-blue-500';
  if (percentage >= 50 && percentage < 60) return 'bg-purple-500';
  if (percentage >= 40 && percentage < 50) return 'bg-yellow-500';
  if (percentage >= 30 && percentage < 40) return 'bg-amber-500';
  return 'bg-red-500';
}

describe('ProgressBar Component', () => {
  it('renders the component', () => {
    render(<ProgressBar percentage={50} />);
    const progressBarElement = screen.getByText('50%');
    expect(progressBarElement).toBeInTheDocument();
  });

  it('applies correct width based on the percentage', () => {
    const percentage = 75;
    render(<ProgressBar percentage={percentage} />);
    const progressBarElement = screen.getByText(`${percentage}%`).parentElement;
    expect(progressBarElement).toHaveStyle(`width: ${percentage}%`);
  });

  it('applies the correct color class based on the percentage', () => {
    const percentage = 90;
    const colorClass = getProgressBarColorClass(percentage);
    render(<ProgressBar percentage={percentage} />);
    const progressBarElement = screen.getByText(`${percentage}%`).parentElement;
    expect(progressBarElement).toHaveClass(colorClass);
  });

  it('applies default class names and custom class names correctly', () => {
    render(
      <ProgressBar
        percentage={40}
        parentClassname="custom-parent-class"
        percentageClassname="custom-percentage-class"
      />
    );
    const parentDiv = screen.getByText('40%').parentElement?.parentElement;
    expect(parentDiv).toHaveClass('custom-parent-class');

    const percentageSpan = screen.getByText('40%');
    expect(percentageSpan).toHaveClass('custom-percentage-class');
  });

  it('caps the percentage at 100 and does not exceed', () => {
    render(<ProgressBar percentage={150} />);
    const progressBarElement = screen.getByText('100%');
    expect(progressBarElement).toBeInTheDocument();
  });

  it('does not go below 0 even with negative percentage', () => {
    render(<ProgressBar percentage={-20} />);
    const progressBarElement = screen.getByText('0%');
    expect(progressBarElement).toBeInTheDocument();
  });
});
