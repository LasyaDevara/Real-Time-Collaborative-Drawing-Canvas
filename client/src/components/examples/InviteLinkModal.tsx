import InviteLinkModal from '../InviteLinkModal';

export default function InviteLinkModalExample() {
  return (
    <InviteLinkModal
      isOpen={true}
      onClose={() => console.log('Close modal')}
      inviteLink="https://collabcanvas.repl.co/?room=abc123xyz"
    />
  );
}
