import ContentWrapper from '../../components/ui/ContentWrapper';
import PageHeader from '../../components/ui/PageHeader';
import { FaFilePdf } from 'react-icons/fa6';
import {
    useLaporanResmi,
    LaporanResmiTable,
} from '../../features/ortu/laporanResmi';

export default function LaporanResmiAnak() {
    const {
        laporanList,
        isLoading,
        isDownloading,
        downloadingId,
        handleDownload,
        refreshLaporan,
    } = useLaporanResmi();

    return (
        <div className="space-y-6">
            <PageHeader
                icon={<FaFilePdf />}
                title="Laporan Resmi (Rapor)"
                description="Lihat dan unduh laporan nilai resmi anak Anda dalam format PDF."
            />

            <ContentWrapper>
                <LaporanResmiTable
                    data={laporanList}
                    isLoading={isLoading}
                    isDownloading={isDownloading}
                    downloadingId={downloadingId}
                    onDownload={handleDownload}
                />
            </ContentWrapper>
        </div>
    );
}
