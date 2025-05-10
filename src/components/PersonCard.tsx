'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Person } from '@/lib/tmdb'; // Using 'type' import
import { IMG_URL } from '@/lib/tmdb';

interface PersonCardProps {
  person: Person;
}

const PersonCard = ({ person }: PersonCardProps) => (
  <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden w-full h-full flex flex-col"> {/* Ensure card takes full space of its container */}
    <Link href={`/person/${person.id}`} passHref>
      <div className="cursor-pointer flex flex-col flex-grow">
        <div className="relative w-full aspect-[2/3]"> {/* Aspect ratio for poster-like image */}
          <Image
            src={person.profile_path ? `${IMG_URL}${person.profile_path}` : '/logo64x64.png'} // Assuming logo is in public
            alt={person.name}
            layout="fill" // Use layout fill for responsive image sizing within aspect ratio container
            objectFit="cover" // Cover ensures the image fills the space, might crop
            className="rounded-t-lg" // Apply rounding to top of image if card itself is rounded
          />
        </div>
        <div className="p-3 flex flex-col flex-grow"> {/* Reduced padding slightly, ensure text area can grow */}
          <h3 className="text-base font-semibold text-white leading-tight mb-1 truncate" title={person.name}> {/* Truncate long names */}
            {person.name}
          </h3>
          <p className="text-xs text-gray-400 flex-grow"> {/* Allow department to take space */}
            {person.known_for_department}
          </p>
        </div>
      </div>
    </Link>
  </div>
);

export default PersonCard;
