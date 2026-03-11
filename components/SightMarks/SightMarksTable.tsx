import styles from './SightMarksTable.module.css';
import { SightMark } from '@/types/SightMarks';
import { LuTrash2 } from 'react-icons/lu';
import { Button } from '@/components/common/Button/Button';

interface SightMarksTableProps {
	sightMarks: SightMark[];
	onDelete: (id: string) => Promise<void>;
	isDeleting?: boolean;
}

export function SightMarksTable({ sightMarks, onDelete, isDeleting = false }: SightMarksTableProps) {
	if (sightMarks.length === 0) {
		return (
			<div className={styles.emptyState}>
				<p>Ingen siktemerker ennå. Opprett din første siktemerker i appen.</p>
			</div>
		);
	}

	const handleDelete = async (id: string) => {
		if (confirm('Er du sikker på at du vil slette denne sikte merkingen?')) {
			await onDelete(id);
		}
	};

	return (
		<div className={styles.tableWrapper}>
			<table className={styles.table}>
				<thead>
					<tr>
						<th>Bue</th>
						<th>Merker</th>
						<th>Avstand (m)</th>
						<th>Opprettet</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{sightMarks.map((sightMark) => (
						<tr key={sightMark.id}>
							<td>{sightMark.bowSpec?.bow?.name || 'Ukjent bue'}</td>
							<td>{sightMark.givenMarks.length > 0 ? sightMark.givenMarks.join(', ') : '-'}</td>
							<td>{sightMark.givenDistances.length > 0 ? sightMark.givenDistances.join(', ') : '-'}</td>
							<td>{new Date(sightMark.createdAt || '').toLocaleDateString('nb-NO')}</td>
							<td className={styles.actions}>
								<Button
									label="Slett"
									icon={<LuTrash2 size={16} />}
									onClick={() => handleDelete(sightMark.id)}
									size="small"
									disabled={isDeleting}
									variant="warning"
									buttonType="outline"
									width={80}
								/>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
