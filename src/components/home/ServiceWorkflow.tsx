import { Building2, ClipboardCheck, HardDrive, MapPinned, PackageCheck } from 'lucide-react';

const STEPS = [
  { Icon: Building2, title: 'Customer site', fields: ['Location', 'Contacts', 'Service history'] },
  { Icon: HardDrive, title: 'Installed systems', fields: ['Equipment', 'Software versions', 'Serial numbers'] },
  { Icon: ClipboardCheck, title: 'Maintenance status', fields: ['Coverage dates', 'Follow-ups', 'Missing-data flags'] },
  { Icon: MapPinned, title: 'Visit plan', fields: ['Nearby sites on a map', 'Stop order', 'Drive time'] },
];

/**
 * What Service Map Planner connects, drawn as a workflow. Honest evidence for a
 * private app: it shows the records and the flow, not customer data.
 */
export default function ServiceWorkflow({ label }: { label: string }) {
  return (
    <div className="workflow" role="img" aria-label={label}>
      <ol className="workflow__steps">
        {STEPS.map(({ Icon, title, fields }, i) => (
          <li key={title} className="workflow__step">
            <span className="workflow__icon"><Icon size={18} aria-hidden="true" /></span>
            <div>
              <p className="workflow__title"><span>{i + 1}</span>{title}</p>
              <p className="workflow__fields">{fields.map((f) => <span key={f}>{f}</span>)}</p>
            </div>
            {i === 1 && (
              <div className="workflow__branch">
                <span className="workflow__icon workflow__icon--small"><PackageCheck size={15} aria-hidden="true" /></span>
                <div>
                  <p className="workflow__title">Replacement request</p>
                  <p className="workflow__fields"><span>Serial</span><span>Service status</span><span>Shipping</span></p>
                </div>
              </div>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
