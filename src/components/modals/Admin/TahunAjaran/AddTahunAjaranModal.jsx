import { useState } from "react";
import { FaCalendarAlt, FaTimes, FaPlus } from "react-icons/fa";
import Button from "../../../ui/Button";
import { TahunAjaranService } from "../../../../services/Admin/tahunajaran/TahunAjaranService";
import toast from "react-hot-toast";

export default function AddTahunAjaranModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    tahun: "",
    semester: "Ganjil",
    tanggal_mulai: "",
    tanggal_selesai: "",
    status: "tidak-aktif"
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };
  const handleTahunChange = (e) => {
    let value = e.target.value;
    value = value.replace(/[^0-9/]/g, '');
    if (value.length === 4 && !value.includes('/')) {
      value = value + '/';
    }
    if (value.includes('/') && value.length >= 5) {
      const parts = value.split('/');
      const tahunPertama = parts[0];
      if (tahunPertama.length === 4) {
        const tahunKedua = parseInt(tahunPertama) + 1;
        value = `${tahunPertama}/${tahunKedua}`;
      }
    }
    if (value.length > 9) {
      value = value.substring(0, 9);
    }
    setFormData(prev => ({
      ...prev,
      tahun: value
    }));
    if (errors.tahun) {
      setErrors(prev => ({
        ...prev,
        tahun: ""
      }));
    }
  };
  const validateForm = () => {
    const newErrors = {};
    if (!formData.tahun.trim()) {
      newErrors.tahun = "Tahun ajaran harus diisi";
    } else if (!/^\d{4}\/\d{4}$/.test(formData.tahun)) {
      newErrors.tahun = "Format tahun harus YYYY/YYYY (contoh: 2024/2025)";
    } else {
      const [tahunPertama, tahunKedua] = formData.tahun.split('/');
      const tahunPertamaInt = parseInt(tahunPertama);
      const tahunKeduaInt = parseInt(tahunKedua);

      if (tahunKeduaInt !== tahunPertamaInt + 1) {
        newErrors.tahun = `Tahun kedua harus ${tahunPertamaInt + 1} (tahun pertama + 1)`;
      }
    }
    if (!["Ganjil", "Genap"].includes(formData.semester)) {
      newErrors.semester = "Semester harus 'Ganjil' atau 'Genap'";
    }
    if (!formData.tanggal_mulai) {
      newErrors.tanggal_mulai = "Tanggal mulai harus diisi";
    }
    if (!formData.tanggal_selesai) {
      newErrors.tanggal_selesai = "Tanggal selesai harus diisi";
    }
    if (formData.tanggal_mulai && formData.tanggal_selesai) {
      if (new Date(formData.tanggal_mulai) >= new Date(formData.tanggal_selesai)) {
        newErrors.tanggal_selesai = "Tanggal mulai harus lebih kecil dari tanggal selesai";
      }
    }
    if (!["aktif", "tidak-aktif"].includes(formData.status)) {
      newErrors.status = "Status harus 'aktif' atau 'tidak-aktif'";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Mohon perbaiki data yang tidak valid");
      return;
    }

    setIsLoading(true);

    try {
      const response = await TahunAjaranService.create(formData);

      if (response.status === 'success') {
        toast.success(response.message || 'Tahun ajaran berhasil ditambahkan');
        handleClose();
        onSuccess?.();
      }
    } catch (error) {
      console.error('Error creating tahun ajaran:', error);
      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message;

        if (errorMessage.includes('sudah ada tahun ajaran aktif')) {
          toast.error(errorMessage);
        } else if (errorMessage.includes('sudah ada')) {
          toast.error(errorMessage);
        } else if (errorMessage.includes('overlap')) {
          toast.error(errorMessage);
        } else if (errorMessage.includes('wajib diisi')) {
          toast.error(errorMessage);
        } else if (errorMessage.includes('tanggal mulai harus lebih kecil')) {
          toast.error(errorMessage);
        } else if (errorMessage.includes('semester harus')) {
          toast.error(errorMessage);
        } else if (errorMessage.includes('status harus')) {
          toast.error(errorMessage);
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error('Gagal menambahkan tahun ajaran');
      }
    } finally {
      setIsLoading(false);
    }
  };
  const handleClose = () => {
    setFormData({
      tahun: "",
      semester: "Ganjil",
      tanggal_mulai: "",
      tanggal_selesai: "",
      status: "tidak-aktif"
    });
    setErrors({});
    onClose();
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <FaCalendarAlt className="text-emerald-600 text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Tambah Tahun Ajaran</h2>
              <p className="text-sm text-gray-600">Buat tahun ajaran baru</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <FaTimes className="text-gray-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tahun Ajaran *
            </label>
            <input
              type="text"
              name="tahun"
              value={formData.tahun}
              onChange={handleTahunChange}
              placeholder="2024/2025"
              disabled={isLoading}
              maxLength={9}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${errors.tahun
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300'
                }`}
            />
            {errors.tahun && (
              <p className="text-red-500 text-xs mt-1">{errors.tahun}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Semester *
            </label>
            <select
              name="semester"
              value={formData.semester}
              onChange={handleInputChange}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="Ganjil">Ganjil</option>
              <option value="Genap">Genap</option>
            </select>
            {errors.semester && (
              <p className="text-red-500 text-xs mt-1">{errors.semester}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Mulai *
            </label>
            <input
              type="date"
              name="tanggal_mulai"
              value={formData.tanggal_mulai}
              onChange={handleInputChange}
              disabled={isLoading}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${errors.tanggal_mulai
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300'
                }`}
            />
            {errors.tanggal_mulai && (
              <p className="text-red-500 text-xs mt-1">{errors.tanggal_mulai}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Selesai *
            </label>
            <input
              type="date"
              name="tanggal_selesai"
              value={formData.tanggal_selesai}
              onChange={handleInputChange}
              disabled={isLoading}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${errors.tanggal_selesai
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300'
                }`}
            />
            {errors.tanggal_selesai && (
              <p className="text-red-500 text-xs mt-1">{errors.tanggal_selesai}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="tidak-aktif">Tidak Aktif</option>
              <option value="aktif">Aktif</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              icon={isLoading ? null : <FaPlus />}
              className="flex-1"
            >
              {isLoading ? "Menyimpan..." : "Tambah"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
