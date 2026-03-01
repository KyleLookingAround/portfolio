import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WidgetCard from '../components/WidgetCard';

describe('WidgetCard', () => {
  it('renders title and icon', () => {
    render(
      <WidgetCard title="Test Widget" icon="🧪">
        <div>Content</div>
      </WidgetCard>
    );

    expect(screen.getByText('Test Widget')).toBeInTheDocument();
    expect(screen.getByText('🧪')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders meta information when provided', () => {
    render(
      <WidgetCard title="Test Widget" icon="🧪" meta="Test Meta">
        <div>Content</div>
      </WidgetCard>
    );

    expect(screen.getByText('Test Meta')).toBeInTheDocument();
  });

  it('shows loading skeleton when isLoading is true', () => {
    render(
      <WidgetCard title="Test Widget" icon="🧪" isLoading={true}>
        <div>Content</div>
      </WidgetCard>
    );

    // Content should not be visible
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
    // Skeleton should have animation class
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('shows error message when error is provided', () => {
    render(
      <WidgetCard title="Test Widget" icon="🧪" error="Something went wrong">
        <div>Content</div>
      </WidgetCard>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('⚠️')).toBeInTheDocument();
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('shows retry button when error and onRetry provided', () => {
    const onRetry = vi.fn();
    render(
      <WidgetCard title="Test Widget" icon="🧪" error="Error occurred" onRetry={onRetry}>
        <div>Content</div>
      </WidgetCard>
    );

    const retryButton = screen.getByRole('button', { name: /try again/i });
    expect(retryButton).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    
    render(
      <WidgetCard title="Test Widget" icon="🧪" error="Error occurred" onRetry={onRetry}>
        <div>Content</div>
      </WidgetCard>
    );

    const retryButton = screen.getByRole('button', { name: /try again/i });
    await user.click(retryButton);
    
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    const { container } = render(
      <WidgetCard title="Test Widget" icon="🧪" className="custom-class">
        <div>Content</div>
      </WidgetCard>
    );

    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('renders children when not loading and no error', () => {
    render(
      <WidgetCard title="Test Widget" icon="🧪" isLoading={false} error={null}>
        <div data-testid="widget-content">Test Content</div>
      </WidgetCard>
    );

    expect(screen.getByTestId('widget-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});
