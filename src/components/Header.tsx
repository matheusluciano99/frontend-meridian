import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/contexts/WalletContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Shield, User, History, LogOut, Settings, Coins, FileText, Wallet, RefreshCw, Package, Settings2 } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout, syncWalletBalance } = useAuth();
  const { wallet } = useWallet();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSyncBalance = async () => {
    try {
      console.log('🔄 Forcing balance synchronization...');
      const balance = await syncWalletBalance();
      console.log('✅ Synchronization completed:', balance);
    } catch (error) {
      console.error('❌ Synchronization error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even with error, redirect to login
      navigate('/login');
    }
  };

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-success text-success-foreground';
      case 'pending':
        return 'bg-warning text-warning-foreground';
      case 'rejected':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const getNavLinkClass = (path: string) => {
    const baseClass = "transition-smooth";
    const activeClass = "text-foreground font-medium";
    const inactiveClass = "text-muted-foreground hover:text-foreground";
    
    return `${baseClass} ${isActiveRoute(path) ? activeClass : inactiveClass}`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/insurance_logo.png" 
              alt="Insurance Logo" 
              className="w-8 h-8 object-contain"
            />
            <span className="hidden md:inline text-xl font-bold text-gradient-primary">
              Stellar Insurance
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/products" className={getNavLinkClass('/products')}>
              Products
            </Link>
            <Link to="/coverage" className={getNavLinkClass('/coverage')}>
              Coverage
            </Link>
            <Link to="/history" className={getNavLinkClass('/history')}>
              History
            </Link>
            <Link to="/claims" className={getNavLinkClass('/claims')}>
              Claims
            </Link>
            <Link to="/profile" className={getNavLinkClass('/profile')}>
              Profile
            </Link>
          </nav>

          {/* User Menu */}
          {user && (
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className={getKycStatusColor(user.kycStatus)}>
                KYC: {user.kycStatus.charAt(0).toUpperCase() + user.kycStatus.slice(1)}
              </Badge>

              {/* Balance */}
              <div className="flex items-center space-x-2 bg-primary/10 px-3 py-1.5 rounded-lg">
                {wallet ? (
                  <>
                    <Wallet className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary">
                      {user.balance.toFixed(2)} XLM
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {wallet.network === 'testnet' ? 'Testnet' : 'Mainnet'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSyncBalance}
                      className="h-6 w-6 p-0"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Coins className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Connect wallet
                    </span>
                  </>
                )}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.name}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/products">
                      <Package className="mr-2 h-4 w-4" />
                      Products
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/coverage">
                      <Shield className="mr-2 h-4 w-4" />
                      Coverage
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/history">
                      <History className="mr-2 h-4 w-4" />
                      History
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/claims">
                      <FileText className="mr-2 h-4 w-4" />
                      Claims
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/admin/products">
                      <Settings2 className="mr-2 h-4 w-4" />
                      Admin Products
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};