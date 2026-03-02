import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import LocalServicesWidget from '../components/LocalServicesWidget';

describe('LocalServicesWidget', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders emergency service numbers (999, 111)', () => {
    render(<LocalServicesWidget />);
    expect(screen.getByText('999')).toBeInTheDocument();
    expect(screen.getByText('111')).toBeInTheDocument();
    expect(screen.getByText('Emergency Services')).toBeInTheDocument();
    expect(screen.getByText('NHS Non-Emergency')).toBeInTheDocument();
  });

  it('renders council service phone links with correct tel: hrefs', () => {
    render(<LocalServicesWidget />);
    const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
    // 2 emergency + 4 council = 6 tel links
    expect(phoneLinks.length).toBeGreaterThanOrEqual(6);
    const councilLink = document.querySelector('a[href="tel:01614744949"]');
    expect(councilLink).toBeInTheDocument();
  });

  it('renders quick-link anchors', () => {
    render(<LocalServicesWidget />);
    expect(screen.getByText(/Find Your Bin Day/)).toBeInTheDocument();
    expect(screen.getByText(/Stockport Libraries/)).toBeInTheDocument();
    expect(screen.getByText(/Leisure Centres/)).toBeInTheDocument();
    expect(screen.getByText(/Plaza Theatre/)).toBeInTheDocument();
  });

  it('calls onStatusChange with ready on mount', async () => {
    const onStatusChange = vi.fn();
    render(<LocalServicesWidget onStatusChange={onStatusChange} />);
    await waitFor(() => expect(onStatusChange).toHaveBeenCalledWith('ready'));
  });
});
