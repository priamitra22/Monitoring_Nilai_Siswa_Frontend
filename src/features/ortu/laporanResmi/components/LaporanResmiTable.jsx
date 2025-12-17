import { Download } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import { formatFileSize, formatDate } from '../utils/formatters';
import { FaCheckCircle } from 'react-icons/fa';

export default function LaporanResmiTable({
    data,
    isLoading,
    isDownloading,
    downloadingId,
    onDownload,
}) {
    return (
        <div className="space-y-4">
            {/* Loading State */}
            {isLoading ? (
                <div className="text-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Memuat data laporan...</p>
                </div>
            ) : data.length === 0 ? (
                /* Empty State */
                <div className="text-center py-16">
                    <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        Belum Ada Laporan Resmi
                    </h3>
                    <p className="text-gray-500">
                        Laporan nilai resmi belum tersedia. Silakan hubungi pihak sekolah untuk informasi lebih lanjut.
                    </p>
                </div>
            ) : (
                /* Table */
                <>
                    {/* Table Header */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">
                                Daftar Laporan Nilai Resmi
                            </h3>
                            <p className="text-sm text-gray-600">
                                Menampilkan {data.length} laporan
                            </p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                                        No
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                                        NISN
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                                        Nama Siswa
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                                        Kelas
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                                        Tahun Ajaran
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                                        Semester
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                                        Versi
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                                        Tanggal Upload
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                                        Ukuran
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {data.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        {/* No */}
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                                            {index + 1}
                                        </td>

                                        {/* NISN */}
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-mono text-gray-900">
                                            {item.nisn}
                                        </td>

                                        {/* Nama Siswa */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {item.nama_siswa}
                                        </td>

                                        {/* Kelas */}
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                                            {item.kelas_nama}
                                        </td>

                                        {/* Tahun Ajaran */}
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                                            {item.tahun_ajaran}
                                        </td>

                                        {/* Semester */}
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                                            {item.semester}
                                        </td>

                                        {/* Version with Badge */}
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <span className="text-sm font-medium text-gray-900">
                                                    v{item.version}
                                                </span>
                                                {item.is_latest && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                                        <FaCheckCircle className="text-xs" />
                                                        Terbaru
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Upload Date */}
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                                            {formatDate(item.upload_date)}
                                        </td>

                                        {/* File Size */}
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                                            {formatFileSize(item.file_size)}
                                        </td>

                                        {/* Action Button */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex justify-center">
                                                <Button
                                                    variant="success"
                                                    size="sm"
                                                    icon={<Download className="w-4 h-4" />}
                                                    ariaLabel="Download"
                                                    className="text-xs px-2 py-1 min-w-fit"
                                                    onClick={() => onDownload(item.id, item.original_filename)}
                                                    disabled={isDownloading && downloadingId === item.id}
                                                >
                                                    {isDownloading && downloadingId === item.id ? 'Mengunduh...' : 'Download'}
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}
