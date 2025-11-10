import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { authAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";

const Profile: React.FC = () => {
  const { user, logout, refreshUser } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState(user?.email || "");
  const [username, setUsername] = useState(user?.username || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [loadingUsername, setLoadingUsername] = useState(false);

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoadingEmail(true);
      await authAPI.updateEmail({ email });
      await refreshUser();
      toast({
        title: "Email diperbarui",
        description: "Email berhasil diubah",
      });
    } catch (err: any) {
      toast({
        title: "Gagal",
        description: err.response?.data?.message || "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setLoadingEmail(false);
    }
  };

  const handleChangeUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoadingUsername(true);
      await authAPI.updateUsername({ username });
      await refreshUser();
      toast({
        title: "Username diperbarui",
        description: "Username berhasil diubah",
      });
    } catch (err: any) {
      toast({
        title: "Gagal",
        description: err.response?.data?.message || "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setLoadingUsername(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoadingPassword(true);
      await authAPI.updatePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      toast({
        title: "Password diperbarui",
        description: "Password berhasil diubah",
      });
    } catch (err: any) {
      toast({
        title: "Gagal",
        description: err.response?.data?.message || "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Yakin ingin menghapus akun? Tindakan ini tidak bisa dibatalkan."
    );
    if (!confirmed) return;

    try {
      await authAPI.deleteAccount();
      toast({ title: "Akun dihapus", description: "Akun Anda telah dihapus" });
      logout();
    } catch (err: any) {
      toast({
        title: "Gagal",
        description: err.response?.data?.message || "Terjadi kesalahan",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-4">Profil</h1>

        <section className="mb-8">
          <h2 className="text-lg font-medium mb-2">Informasi akun</h2>
          <p className="mb-4">Username: {user?.username}</p>
          <form
            onSubmit={handleChangeUsername}
            className="flex gap-2 items-center mb-4"
          >
            <Input
              value={username}
              onChange={(e) =>
                setUsername((e.target as HTMLInputElement).value)
              }
              placeholder="Username"
            />
            <Button type="submit" disabled={loadingUsername}>
              {loadingUsername ? "Menyimpan..." : "Simpan"}
            </Button>
          </form>
          <form
            onSubmit={handleChangeEmail}
            className="flex gap-2 items-center"
          >
            <Input
              value={email}
              onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
              placeholder="Email"
            />
            <Button type="submit" disabled={loadingEmail}>
              {loadingEmail ? "Menyimpan..." : "Simpan"}
            </Button>
          </form>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-medium mb-2">Ubah password</h2>
          <form
            onSubmit={handleChangePassword}
            className="flex flex-col gap-2 max-w-md"
          >
            <Input
              value={currentPassword}
              onChange={(e) =>
                setCurrentPassword((e.target as HTMLInputElement).value)
              }
              type="password"
              placeholder="Password saat ini"
            />
            <Input
              value={newPassword}
              onChange={(e) =>
                setNewPassword((e.target as HTMLInputElement).value)
              }
              type="password"
              placeholder="Password baru"
            />
            <div>
              <Button type="submit" disabled={loadingPassword}>
                {loadingPassword ? "Menyimpan..." : "Ubah Password"}
              </Button>
            </div>
          </form>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-medium mb-2">Hapus akun</h2>
          <p className="mb-2 text-sm text-muted-foreground">
            Menghapus akun akan menghapus data Anda. Tindakan ini tidak bisa
            dibatalkan.
          </p>
          <Button variant="destructive" onClick={handleDeleteAccount}>
            Hapus Akun
          </Button>
        </section>
      </div>
    </div>
  );
};

export default Profile;
