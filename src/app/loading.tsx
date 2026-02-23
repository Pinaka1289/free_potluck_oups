import { PotluckPartyLoader } from '@/components/ui/PotluckPartyLoader'

export default function Loading() {
  return (
    <div className="min-h-[60vh]">
      <PotluckPartyLoader fillContainer title="Loading..." />
    </div>
  )
}
