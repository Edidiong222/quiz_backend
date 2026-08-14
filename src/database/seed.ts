import 'reflect-metadata';
import { DataSource, In } from 'typeorm';
import * as argon2 from 'argon2';

import { User, UserRole } from '../users/entities/user.entity';
import { Quiz } from '../quizzes/quiz.entity';
import { Question, Difficulty } from '../questions/question.entity';
import { Answer } from '../answers/answer.entity';
import { QuizAttempt } from '../attempts/quiz-attempt.entity';
import { AttemptAnswer } from '../attempts/attempt-answer.entity';

interface SeedQuestion {
  questionText: string;
  difficulty: Difficulty;
  points: number;
  explanation: string;
  answers: [string, string, string, string];
  correctIndex: number;
}

interface SeedQuiz {
  title: string;
  description: string;
  category: string;
  difficulty: Difficulty;
  timeLimit: number;
  questions: SeedQuestion[];
}

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? '1234',
  database: process.env.DB_DATABASE ?? 'quiz_db',
  entities: [User, Quiz, Question, Answer, QuizAttempt, AttemptAnswer],
  synchronize: true,
});

const stableIndex = (value: string, modulo: number) =>
  (Array.from(value).reduce((hash, char) => ((hash << 5) - hash + char.charCodeAt(0)) | 0, 0) >>> 0) % modulo;

const q = (
  questionText: string,
  difficulty: Difficulty,
  correct: string,
  distractors: [string, string, string],
  explanation: string,
  points = difficulty === Difficulty.HARD ? 3 : difficulty === Difficulty.MEDIUM ? 2 : 1,
): SeedQuestion => {
  const correctIndex = stableIndex(`${questionText}:${correct}`, 4);
  const answers = [...distractors];
  answers.splice(correctIndex, 0, correct);

  return {
    questionText,
    difficulty,
    points,
    explanation,
    answers: answers as [string, string, string, string],
    correctIndex,
  };
};

const tailwindCore: SeedQuestion[] = [
  q('What does the Tailwind utility p-4 apply?', Difficulty.EASY, 'Padding on all sides', ['Margin on all sides', 'Font size 4', 'A four-column grid'], 'The p-* utilities apply padding. p-4 applies Tailwind spacing scale 4 on every side.'),
  q('What does mx-auto commonly do on a block with a set width?', Difficulty.EASY, 'Centers it horizontally', ['Centers it vertically', 'Adds horizontal padding', 'Makes it full width'], 'mx-auto sets left and right margins to auto, which centers a constrained block horizontally.'),
  q('Which class applies display: flex?', Difficulty.EASY, 'flex', ['block', 'grid-cols-flex', 'items-flex'], 'The flex utility sets display: flex.'),
  q('Which class applies display: grid?', Difficulty.EASY, 'grid', ['grid-rows', 'inline', 'cols-grid'], 'The grid utility sets display: grid.'),
  q('What is Tailwind’s default responsive approach?', Difficulty.MEDIUM, 'Mobile-first min-width breakpoints', ['Desktop-first max-width breakpoints', 'Only container queries', 'Inline media styles'], 'Unprefixed utilities apply to all sizes, and prefixed utilities apply at that breakpoint and above.'),
  q('Which utility makes text bold?', Difficulty.EASY, 'font-bold', ['text-bold', 'bold', 'weight-bold'], 'Font weight utilities use the font-* prefix, such as font-bold.'),
  q('What does rounded-lg affect?', Difficulty.EASY, 'Border radius', ['Box shadow', 'Line height', 'Letter spacing'], 'Rounded utilities control border radius.'),
  q('Which class hides overflow on both axes?', Difficulty.EASY, 'overflow-hidden', ['hidden-overflow', 'clip-all', 'invisible'], 'overflow-hidden sets overflow: hidden.'),
  q('Which utility applies a subtle shadow?', Difficulty.EASY, 'shadow-sm', ['drop-sm', 'box-sm', 'shade-sm'], 'Shadow utilities use the shadow-* naming pattern.'),
  q('How do you apply hover styles in Tailwind?', Difficulty.EASY, 'Prefix the utility with hover:', ['Add .hover to the element', 'Use state-hover()', 'Put hover after the class'], 'Variants like hover: generate selectors for interactive states.'),
  q('Which utility makes an element fixed to the viewport?', Difficulty.EASY, 'fixed', ['sticky-top', 'absolute-screen', 'pin'], 'fixed maps to position: fixed.'),
  q('What does z-10 control?', Difficulty.EASY, 'Stacking order', ['Zoom level', 'Grid columns', 'Opacity'], 'z-* utilities set z-index values.'),
  q('Which class creates a three-column grid?', Difficulty.EASY, 'grid-cols-3', ['cols-3', 'grid-3', 'columns-grid-3'], 'Grid column count utilities use grid-cols-*.'),
  q('What does gap-4 do in flex or grid layouts?', Difficulty.EASY, 'Adds space between children', ['Adds outer margin', 'Adds border spacing only', 'Sets four columns'], 'gap-* controls the row and column gaps between layout children.'),
  q('Which class makes text center aligned?', Difficulty.EASY, 'text-center', ['font-center', 'align-center', 'center-text'], 'Text alignment utilities use text-left, text-center, text-right, and text-justify.'),
  q('What does bg-slate-900 apply?', Difficulty.EASY, 'A dark slate background color', ['A slate text color', 'A border color', 'A font family'], 'Background color utilities use the bg-* prefix.'),
  q('Which utility sets width to 100%?', Difficulty.EASY, 'w-full', ['full-w', 'width-100', 'max-w-full'], 'w-full maps to width: 100%.'),
  q('What does sr-only do?', Difficulty.MEDIUM, 'Visually hides content while keeping it available to screen readers', ['Removes content from accessibility APIs', 'Makes text smaller', 'Hides only on mobile'], 'sr-only is used for accessible text that should not be visually displayed.'),
  q('Which syntax uses an arbitrary value for width?', Difficulty.MEDIUM, 'w-[37rem]', ['w-37rem', 'width(37rem)', 'w:{37rem}'], 'Arbitrary values are wrapped in square brackets.'),
  q('What is the practical benefit of utility-first CSS?', Difficulty.MEDIUM, 'Composing styles directly in markup without writing many custom classes', ['Avoiding CSS entirely in the browser', 'Replacing semantic HTML', 'Automatically designing layouts'], 'Tailwind utilities let teams compose consistent styles quickly while still generating CSS.'),
];

const tailwindResponsive: SeedQuestion[] = [
  q('Which class makes a grid one column by default and three columns on large screens?', Difficulty.MEDIUM, 'grid grid-cols-1 lg:grid-cols-3', ['grid-cols-3 sm:grid-cols-1', 'lg:grid-cols-1 grid-cols-3', 'columns-1 lg:columns-3'], 'Tailwind is mobile-first, so the base class handles mobile and lg: applies at large screens and above.'),
  q('What does md:text-lg mean?', Difficulty.EASY, 'Use text-lg at the md breakpoint and above', ['Use text-lg below md only', 'Use medium font weight', 'Use text-lg only on mobile'], 'Breakpoint prefixes apply utilities when the viewport reaches that min-width.'),
  q('Which breakpoint prefix is larger by default: md or lg?', Difficulty.EASY, 'lg', ['md', 'They are the same', 'Neither exists by default'], 'The default breakpoint scale increases from sm to 2xl.'),
  q('How do unprefixed classes behave with responsive variants?', Difficulty.MEDIUM, 'They apply at all viewport sizes unless overridden', ['They apply only below sm', 'They apply only above lg', 'They are ignored when a prefix exists'], 'Base utilities are the starting style for all sizes.'),
  q('Which class hides an element until medium screens?', Difficulty.MEDIUM, 'hidden md:block', ['block md:hidden', 'md:invisible visible', 'hide md:show'], 'hidden applies by default; md:block overrides it from md upward.'),
  q('What does max-w-7xl control?', Difficulty.EASY, 'Maximum width', ['Minimum width', 'Z-index', 'Font size'], 'max-w-* utilities set max-width.'),
  q('Which utility adds horizontal padding only?', Difficulty.EASY, 'px-4', ['py-4', 'mx-4', 'space-x-4'], 'px-* applies padding-left and padding-right.'),
  q('Why is mobile-first styling helpful?', Difficulty.MEDIUM, 'It makes small screens the default and layers complexity upward', ['It prevents desktop styles', 'It removes media queries', 'It disables desktop browsers'], 'Mobile-first reduces overrides and keeps narrow layouts readable.'),
  q('What does sm:hover:bg-violet-50 mean?', Difficulty.HARD, 'Apply the hover background only at sm screens and above', ['Apply sm color only while hovered on mobile', 'Apply hover below sm only', 'Apply two unrelated classes'], 'Variants can be stacked; both the breakpoint and hover condition must match.'),
  q('Which class changes flex direction on medium screens?', Difficulty.MEDIUM, 'flex-col md:flex-row', ['md:flex-col flex-row', 'direction-row-md', 'flex md:row'], 'The base class is column; md:flex-row overrides from the md breakpoint.'),
  q('What does container usually provide?', Difficulty.MEDIUM, 'Responsive max-width constraints', ['Automatic state management', 'A CSS reset', 'A browser route'], 'Tailwind’s container utility gives breakpoint-aware width constraints.'),
  q('Which class prevents text from wrapping?', Difficulty.EASY, 'whitespace-nowrap', ['text-nowrap', 'wrap-none', 'overflow-nowrap'], 'Whitespace utilities control wrapping behavior.'),
  q('How should you avoid horizontal scrolling on mobile?', Difficulty.MEDIUM, 'Use responsive grids, wrapping, and constrained widths', ['Set every element to w-screen', 'Use fixed pixel widths everywhere', 'Disable overflow on body only'], 'Mobile layouts should adapt instead of relying on fixed desktop dimensions.'),
  q('What does min-h-screen do?', Difficulty.EASY, 'Sets minimum height to the viewport height', ['Sets maximum height to screen width', 'Sets minimum width', 'Centers the screen'], 'min-h-screen maps to min-height: 100vh.'),
  q('Which utility makes an image cover its box?', Difficulty.EASY, 'object-cover', ['cover-image', 'fit-cover', 'image-cover'], 'Object-fit utilities use object-* names.'),
  q('Which class makes a flex item wrap to the next line?', Difficulty.EASY, 'flex-wrap', ['wrap-flex', 'items-wrap', 'flex-newline'], 'flex-wrap enables wrapping in flex containers.'),
  q('What is the default effect of lg:w-1/2?', Difficulty.EASY, 'Width becomes 50% from lg upward', ['Width is 50% below lg', 'Height becomes 50%', 'Margin becomes 50%'], 'Fractional width utilities can be scoped to breakpoints.'),
  q('Which responsive pattern is best for cards?', Difficulty.MEDIUM, 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3', ['grid-cols-3 only', 'w-[320px] for every card', 'absolute-position every card'], 'Cards should progressively add columns as space increases.'),
  q('How do you make a sticky mobile action bar?', Difficulty.HARD, 'sticky bottom-0 with a background and proper z-index', ['absolute top-full', 'fixed without padding', 'hidden md:block'], 'Sticky bottom positioning can keep actions reachable while respecting document flow.'),
  q('What problem can fixed widths cause on small screens?', Difficulty.MEDIUM, 'Horizontal overflow', ['Higher z-index', 'Font smoothing', 'Correct color contrast'], 'Fixed desktop widths often exceed mobile viewport width.'),
];

const tailwindLayout: SeedQuestion[] = [
  q('Which class aligns flex items vertically in the center?', Difficulty.EASY, 'items-center', ['justify-center', 'content-center', 'place-text-center'], 'items-center maps to align-items: center.'),
  q('Which class distributes flex children with space between?', Difficulty.EASY, 'justify-between', ['items-between', 'content-between', 'gap-between'], 'justify-* utilities control main-axis alignment.'),
  q('What does place-items-center do in grid?', Difficulty.MEDIUM, 'Centers items on both axes', ['Centers only text', 'Adds equal gaps', 'Creates a centered container'], 'place-items controls align-items and justify-items together.'),
  q('Which utility allows a flex item to grow?', Difficulty.EASY, 'grow', ['flex-large', 'items-grow', 'basis-grow'], 'grow maps to flex-grow: 1.'),
  q('Which utility prevents flex shrinking?', Difficulty.MEDIUM, 'shrink-0', ['grow-0', 'basis-0', 'no-shrink'], 'shrink-0 maps to flex-shrink: 0.'),
  q('What does basis-1/3 set?', Difficulty.MEDIUM, 'Initial flex basis to one third', ['Grid row span to one third', 'Opacity to one third', 'Gap to one third'], 'flex-basis controls the initial size of a flex item.'),
  q('Which class spans two grid columns?', Difficulty.EASY, 'col-span-2', ['grid-span-2', 'cols-2-span', 'span-cols'], 'Grid span utilities use col-span-* and row-span-*.'),
  q('How do you create rows with auto content and remaining space?', Difficulty.HARD, 'grid-rows-[auto_1fr]', ['grid-rows-auto-1fr', 'rows-auto-fr', 'grid-auto-rows'], 'Arbitrary values let you define custom grid templates.'),
  q('What does auto-rows-fr do?', Difficulty.HARD, 'Makes implicit grid rows equal fractional height', ['Automatically creates four rows', 'Centers all rows', 'Removes row gaps'], 'auto-rows-* controls automatically generated grid rows.'),
  q('Which utility sets display to inline-flex?', Difficulty.EASY, 'inline-flex', ['flex-inline', 'inline items', 'flex-row-inline'], 'inline-flex maps directly to display: inline-flex.'),
  q('What does space-y-4 do?', Difficulty.MEDIUM, 'Adds vertical spacing between sibling children', ['Adds padding to every child', 'Adds margin to the parent', 'Sets grid row gap only'], 'space-y-* applies margins between siblings in a stack.'),
  q('When should gap be preferred over space-x for grids?', Difficulty.MEDIUM, 'When spacing grid rows and columns', ['Only for text', 'Only for absolute elements', 'Never'], 'gap works naturally in both grid and flex layouts.'),
  q('What does justify-items-center affect?', Difficulty.HARD, 'Inline-axis alignment of grid items inside their cells', ['Main-axis flex distribution', 'Line height', 'Absolute positioning'], 'justify-items applies to grid item alignment within grid cells.'),
  q('Which class makes an element block-level?', Difficulty.EASY, 'block', ['display-block', 'd-block', 'box-block'], 'block sets display: block.'),
  q('Which class visually removes an element and its layout space?', Difficulty.EASY, 'hidden', ['invisible', 'opacity-0', 'sr-only'], 'hidden sets display: none, removing layout space.'),
  q('What does invisible do?', Difficulty.EASY, 'Hides visually but preserves layout space', ['Removes from layout', 'Disables events only', 'Clips overflow'], 'invisible sets visibility: hidden.'),
  q('Which class makes columns auto-fit with a custom minmax?', Difficulty.HARD, 'grid-cols-[repeat(auto-fit,minmax(16rem,1fr))]', ['grid-auto-fit-16', 'auto-cols-minmax', 'cols-repeat-fit'], 'Arbitrary grid templates can express advanced CSS values.'),
  q('What does content-center control?', Difficulty.HARD, 'Alignment of flex/grid lines as a group', ['Individual child alignment', 'Text alignment', 'Parent display'], 'align-content works when there are multiple flex/grid lines.'),
  q('Which class sets overflow on the x-axis only?', Difficulty.EASY, 'overflow-x-auto', ['x-overflow-auto', 'overflow-auto-x', 'scroll-x'], 'Axis-specific overflow utilities use overflow-x-* and overflow-y-*.'),
  q('Which layout is best for a sidebar plus fluid content?', Difficulty.MEDIUM, 'grid grid-cols-[18rem_1fr]', ['absolute everything', 'flex with all children fixed width', 'table layout'], 'A custom grid template gives a stable sidebar and flexible main area.'),
];

const tailwindTypography: SeedQuestion[] = [
  q('Which utility sets font size to extra large?', Difficulty.EASY, 'text-xl', ['font-xl', 'size-xl', 'type-xl'], 'Text size utilities use text-* names.'),
  q('Which utility sets line height to relaxed?', Difficulty.EASY, 'leading-relaxed', ['line-relaxed', 'tracking-relaxed', 'font-relaxed'], 'Line-height utilities use leading-*.'),
  q('What does tracking-wide change?', Difficulty.EASY, 'Letter spacing', ['Line height', 'Font weight', 'Text alignment'], 'tracking-* utilities control letter spacing.'),
  q('Which utility truncates overflowing text with ellipsis?', Difficulty.MEDIUM, 'truncate', ['ellipsis', 'text-hidden', 'overflow-ellipsis-only'], 'truncate combines overflow hidden, no wrap, and text-overflow ellipsis.'),
  q('Which class sets uppercase text?', Difficulty.EASY, 'uppercase', ['text-uppercase', 'case-upper', 'font-uppercase'], 'Text transform utilities include uppercase, lowercase, and capitalize.'),
  q('What does antialiased affect?', Difficulty.MEDIUM, 'Font smoothing', ['Font weight', 'Text decoration', 'Letter spacing'], 'antialiased adjusts font smoothing behavior.'),
  q('Which utility sets text color?', Difficulty.EASY, 'text-emerald-700', ['font-emerald-700', 'color-text-emerald', 'type-emerald'], 'Text color utilities share the text-* prefix with font-size utilities.'),
  q('Which class adds underline?', Difficulty.EASY, 'underline', ['text-underline', 'decoration-line', 'line-under'], 'underline sets text-decoration-line: underline.'),
  q('What does decoration-2 control?', Difficulty.MEDIUM, 'Text decoration thickness', ['Line height', 'Border width', 'Letter spacing'], 'Decoration utilities affect underlines and other text decorations.'),
  q('Which utility sets a monospace font?', Difficulty.EASY, 'font-mono', ['mono', 'text-mono', 'family-mono'], 'Font family utilities use font-sans, font-serif, and font-mono.'),
  q('Which class balances heading line breaks when supported?', Difficulty.HARD, 'text-balance', ['balance-text', 'leading-balance', 'wrap-balance'], 'text-balance maps to text-wrap: balance in modern browsers.'),
  q('What does prose usually come from?', Difficulty.HARD, 'The typography plugin', ['Tailwind core only in every install', 'React Router', 'PostCSS reset'], 'The prose class is provided by @tailwindcss/typography, not base Tailwind utilities.'),
  q('Which class sets text alignment to the right?', Difficulty.EASY, 'text-right', ['align-right', 'right-text', 'justify-text-right'], 'Text alignment uses text-* utilities.'),
  q('What is a common typography mistake?', Difficulty.MEDIUM, 'Using huge display sizes inside dense cards', ['Using readable line height', 'Limiting measure', 'Using semantic headings'], 'Display type should be reserved for true hero or page-level headings.'),
  q('Which utility controls font weight 500?', Difficulty.EASY, 'font-medium', ['weight-500', 'text-medium', 'medium-font'], 'font-medium maps to a medium font weight.'),
  q('What does leading-none do?', Difficulty.EASY, 'Sets line-height to 1', ['Removes text', 'Disables wrapping', 'Sets font weight to zero'], 'leading-none creates tight line-height.'),
  q('Which class sets italic text?', Difficulty.EASY, 'italic', ['font-italic', 'text-italic', 'style-italic'], 'italic sets font-style: italic.'),
  q('How can you limit paragraph width for readability?', Difficulty.MEDIUM, 'Use max-w-prose or another max-w utility', ['Use z-index', 'Use text-nowrap', 'Use fixed viewport height'], 'Readable measure is often controlled with max-width.'),
  q('What does break-words help with?', Difficulty.MEDIUM, 'Long words or URLs wrapping instead of overflowing', ['Adding word spacing', 'Increasing font size', 'Changing font weight'], 'break-words prevents long tokens from breaking layout.'),
  q('Which utility sets text opacity through color alpha syntax?', Difficulty.HARD, 'text-slate-900/70', ['text-opacity-70 only', 'opacity-text-70', 'slate-900-alpha'], 'Modern Tailwind supports slash opacity on color utilities.'),
];

const tailwindPosition: SeedQuestion[] = [
  q('Which class makes an element position relative?', Difficulty.EASY, 'relative', ['position-relative', 'rel', 'inset-relative'], 'relative maps to position: relative.'),
  q('Which parent setup lets an absolute child position inside it?', Difficulty.MEDIUM, 'Make the parent relative', ['Make the parent hidden', 'Make the child block', 'Use z-0 only'], 'Absolutely positioned children use the nearest positioned ancestor.'),
  q('What does inset-0 do?', Difficulty.EASY, 'Sets top, right, bottom, and left to 0', ['Sets padding to 0', 'Sets z-index to 0', 'Sets opacity to 0'], 'Inset utilities control positioned offsets.'),
  q('Which class pins an element to the top?', Difficulty.EASY, 'top-0', ['pin-top', 'inset-top', 'y-0'], 'top-* sets the CSS top property.'),
  q('What does sticky top-0 create?', Difficulty.MEDIUM, 'An element that sticks to the top while scrolling in its container', ['An element always fixed to viewport', 'A hidden element', 'A centered element'], 'Sticky positioning behaves relative until the scroll threshold is reached.'),
  q('Which utility sets z-index to 50?', Difficulty.EASY, 'z-50', ['index-50', 'zindex-50', 'stack-50'], 'z-* utilities control z-index.'),
  q('What does absolute do to document flow?', Difficulty.MEDIUM, 'Removes the element from normal flow', ['Keeps all layout space', 'Centers the element', 'Adds scrollbars automatically'], 'Absolutely positioned elements do not occupy normal layout space.'),
  q('Which class positions at the bottom right?', Difficulty.EASY, 'bottom-0 right-0', ['end-bottom', 'inset-bottom-right', 'place-bottom-right'], 'Offset utilities can be combined for corners.'),
  q('What does -top-2 represent?', Difficulty.MEDIUM, 'A negative top offset from the spacing scale', ['Invalid syntax', 'A top margin only', 'A z-index'], 'Tailwind supports negative spacing with a leading dash.'),
  q('Which utility creates full-screen fixed overlay coverage?', Difficulty.MEDIUM, 'fixed inset-0', ['absolute full', 'screen-cover', 'sticky inset-full'], 'fixed inset-0 covers the viewport when no dimensions constrain it.'),
  q('When can z-index appear not to work?', Difficulty.HARD, 'When stacking contexts are created by transforms, opacity, or positioned ancestors', ['When text is bold', 'When using padding', 'When colors are neutral'], 'CSS stacking contexts determine how z-index values compare.'),
  q('What does isolate do?', Difficulty.HARD, 'Creates a new stacking context', ['Hides children', 'Disables pointer events', 'Adds spacing'], 'isolate maps to isolation: isolate.'),
  q('Which class disables pointer events?', Difficulty.EASY, 'pointer-events-none', ['events-none', 'click-none', 'disable-pointer'], 'Pointer-event utilities control hit testing.'),
  q('Which class restores pointer events?', Difficulty.EASY, 'pointer-events-auto', ['events-auto', 'click-auto', 'pointer-auto-only'], 'pointer-events-auto restores default pointer handling.'),
  q('What does fixed bottom-4 right-4 commonly create?', Difficulty.EASY, 'A floating action button position', ['A grid cell', 'A flex row', 'A table caption'], 'Fixed positioning with bottom/right offsets is common for floating actions.'),
  q('Which positioning class keeps layout space?', Difficulty.MEDIUM, 'relative', ['absolute', 'fixed', 'hidden'], 'relative keeps its normal position in document flow.'),
  q('What should modals usually include beyond fixed inset-0?', Difficulty.MEDIUM, 'Background, z-index, focus handling, and accessible semantics', ['Only a high z-index', 'Only opacity-0', 'Only negative margin'], 'A polished modal needs visual, stacking, and accessibility considerations.'),
  q('Which class uses logical start offset?', Difficulty.HARD, 'start-0', ['left-logical', 'inline-start', 'x-start'], 'Logical inset utilities support writing modes and directionality.'),
  q('Why avoid absolute positioning for whole page layout?', Difficulty.MEDIUM, 'It breaks natural flow and responsiveness', ['It cannot render colors', 'It disables media queries', 'It prevents text'], 'Normal flex/grid flow is usually more resilient.'),
  q('Which class clips content to a rounded container?', Difficulty.MEDIUM, 'overflow-hidden', ['clip-rounded', 'rounded-clip', 'hidden-radius'], 'Rounded corners only clip children when overflow is hidden.'),
];

const tailwindEffects: SeedQuestion[] = [
  q('Which class scales an element to 105%?', Difficulty.EASY, 'scale-105', ['transform-105', 'size-105', 'zoom-105'], 'Scale utilities control transform scale.'),
  q('Which utility rotates an element 45 degrees?', Difficulty.EASY, 'rotate-45', ['turn-45', 'angle-45', 'transform-rotate'], 'Rotation utilities use rotate-*.'),
  q('What does translate-x-4 do?', Difficulty.EASY, 'Moves the element horizontally using transform', ['Adds margin-left', 'Changes grid column', 'Sets left offset'], 'Translate utilities use CSS transforms, not layout margins.'),
  q('Which class enables smooth animated changes for common properties?', Difficulty.EASY, 'transition', ['animate', 'duration', 'smooth'], 'transition sets transition-property for common animatable properties.'),
  q('Which class sets transition duration to 300ms?', Difficulty.EASY, 'duration-300', ['time-300', 'transition-300', 'delay-300'], 'Duration utilities use duration-*.'),
  q('Which class delays a transition?', Difficulty.EASY, 'delay-150', ['wait-150', 'duration-delay', 'transition-wait'], 'Delay utilities use delay-*.'),
  q('What does ease-in-out control?', Difficulty.MEDIUM, 'Transition timing function', ['Animation duration', 'Transform origin', 'Opacity only'], 'Ease utilities control acceleration timing.'),
  q('Which class applies a continuous spin animation?', Difficulty.EASY, 'animate-spin', ['spin', 'animation-spin', 'rotate-loop'], 'Animation utilities use animate-*.'),
  q('How do you change a child when the parent is hovered?', Difficulty.MEDIUM, 'Use group on the parent and group-hover:* on the child', ['Use parent-hover only', 'Use hover-child', 'Use peer-hover on parent'], 'The group variant lets descendant styles respond to ancestor state.'),
  q('How do you style based on a sibling input state?', Difficulty.HARD, 'Use peer on the input and peer-checked:* on the sibling', ['Use group only', 'Use sibling-checked without markup', 'Use focus-without'], 'Peer variants respond to a preceding sibling marked with peer.'),
  q('Which class changes opacity to 50%?', Difficulty.EASY, 'opacity-50', ['alpha-50', 'transparent-50', 'fade-50'], 'Opacity utilities use opacity-*.'),
  q('What does origin-top-right affect?', Difficulty.MEDIUM, 'The transform origin point', ['The absolute position', 'The shadow direction', 'The grid origin'], 'Transform origin changes the point around which transforms occur.'),
  q('Which classes create a hover lift effect?', Difficulty.MEDIUM, 'transition hover:-translate-y-1 hover:shadow-md', ['hover:top-1 only', 'absolute hover:block', 'grid hover:flex'], 'Transforms plus shadow changes are common for subtle lift interactions.'),
  q('What does blur-sm apply?', Difficulty.EASY, 'A CSS filter blur', ['Backdrop blur only', 'Text shadow', 'Border smoothing'], 'blur-* applies filter: blur(...).'),
  q('What is backdrop-blur useful for?', Difficulty.MEDIUM, 'Blurring content behind translucent surfaces', ['Blurring only text inside', 'Changing font weight', 'Removing backgrounds'], 'Backdrop filters affect pixels behind the element.'),
  q('Which class skews on the x-axis?', Difficulty.EASY, 'skew-x-6', ['skew-6-x', 'x-skew', 'tilt-x'], 'Skew utilities use skew-x-* and skew-y-*.'),
  q('Why keep UI animations subtle?', Difficulty.MEDIUM, 'They should support feedback without distracting or harming accessibility', ['Animations always improve usability', 'They replace loading states', 'They fix layout bugs'], 'Motion should clarify state changes and respect user comfort.'),
  q('Which variant responds to keyboard focus?', Difficulty.EASY, 'focus:', ['keyboard:', 'tab:', 'active:'], 'focus: applies when an element receives focus.'),
  q('Which variant responds while pressing a button?', Difficulty.EASY, 'active:', ['press:', 'down:', 'click:'], 'active: styles the active interaction state.'),
  q('What does motion-safe: help with?', Difficulty.HARD, 'Only applying motion when the user has not requested reduced motion', ['Forcing animations on all users', 'Disabling transitions globally', 'Speeding up animations'], 'motion-safe respects prefers-reduced-motion accessibility preferences.'),
];

const tailwindAdvanced: SeedQuestion[] = [
  q('Which syntax creates a custom background color value?', Difficulty.MEDIUM, 'bg-[#1f2937]', ['bg-#1f2937', 'background[#1f2937]', 'bg:(#1f2937)'], 'Arbitrary values use square brackets around the raw CSS value.'),
  q('How do you apply dark mode styles with class strategy?', Difficulty.MEDIUM, 'Use dark:* variants under a dark class ancestor', ['Use only media queries manually', 'Use night:* variants', 'Duplicate every component'], 'The dark variant changes styles when dark mode is active according to configuration.'),
  q('What is a common arbitrary-value mistake?', Difficulty.MEDIUM, 'Forgetting square brackets around custom values', ['Using semantic HTML', 'Using spacing utilities', 'Using hover variants'], 'Tailwind only parses arbitrary values when wrapped in brackets.'),
  q('Which class creates a gradient from violet to emerald?', Difficulty.MEDIUM, 'bg-gradient-to-r from-violet-600 to-emerald-500', ['gradient-violet-emerald', 'bg-violet-to-emerald', 'from-to-gradient'], 'Gradients combine direction and color stop utilities.'),
  q('What does via-amber-400 add to a gradient?', Difficulty.MEDIUM, 'An intermediate color stop', ['A border color', 'A font color', 'A z-index'], 'via-* defines a middle gradient stop.'),
  q('Which class targets children with arbitrary variants?', Difficulty.HARD, '[&>*]:p-4', ['children:p-4 always', '*p-4', 'all:p-4'], 'Arbitrary variants can express custom selectors like targeting direct children.'),
  q('How can Tailwind classes become hard to maintain?', Difficulty.MEDIUM, 'Long repeated class strings with no component extraction', ['Using consistent spacing', 'Using reusable buttons', 'Using semantic labels'], 'Repeated complex class groups often belong in reusable components.'),
  q('What does @apply do?', Difficulty.MEDIUM, 'Composes utilities inside CSS', ['Runs JavaScript', 'Creates database rows', 'Adds React props'], '@apply lets you use utilities within CSS rules, though overuse can reduce clarity.'),
  q('What should you avoid in production Tailwind markup?', Difficulty.MEDIUM, 'Building class names dynamically in ways the compiler cannot detect', ['Static class strings', 'Responsive prefixes', 'Semantic HTML'], 'Tailwind scans source files for class names; fully dynamic names may not be generated.'),
  q('Which class controls ring color?', Difficulty.EASY, 'ring-violet-300', ['outline-ring-violet', 'ring-color(violet)', 'focus-violet'], 'Ring utilities control box-shadow based focus rings.'),
  q('What does ring-offset-2 do?', Difficulty.MEDIUM, 'Adds space between ring and element', ['Offsets layout position', 'Adds margin', 'Changes border radius'], 'Ring offset creates a gap around focus rings.'),
  q('Why use design tokens or theme values?', Difficulty.HARD, 'To keep colors, spacing, and typography consistent across the product', ['To remove all CSS', 'To hide markup', 'To avoid accessibility checks'], 'A thoughtful theme supports consistency and maintainability.'),
  q('Which Tailwind feature helps with custom design values without editing config?', Difficulty.MEDIUM, 'Arbitrary values', ['Inline style tags only', 'CSS modules only', 'Webpack loaders'], 'Arbitrary values are useful for one-off custom values.'),
  q('What is a risk of one-note palettes?', Difficulty.MEDIUM, 'Weak visual hierarchy and monotonous UI', ['Faster rendering always', 'Broken routing', 'Invalid HTML'], 'Balanced accent colors help communicate state and hierarchy.'),
  q('Which utility controls accent color for form controls?', Difficulty.HARD, 'accent-violet-600', ['form-violet', 'input-accent-violet', 'check-violet'], 'accent-* sets CSS accent-color for supported controls.'),
  q('What does supports-[display:grid]:grid demonstrate?', Difficulty.HARD, 'A feature-query variant', ['A responsive breakpoint only', 'A hover selector', 'A database filter'], 'supports-* variants conditionally apply utilities when CSS features are supported.'),
  q('Which pattern is best for reusable buttons?', Difficulty.MEDIUM, 'Create a component that centralizes shared utility classes and variants', ['Paste different classes everywhere', 'Use inline styles only', 'Avoid hover states'], 'Reusable components keep UI behavior and styling consistent.'),
  q('How should correct/incorrect states be communicated?', Difficulty.MEDIUM, 'Use color, text, and icons together', ['Use color alone', 'Use animation alone', 'Hide labels'], 'Accessible state communication should not rely only on color.'),
  q('Which class changes cursor on disabled-looking controls?', Difficulty.EASY, 'cursor-not-allowed', ['cursor-disabled', 'not-allowed', 'disabled-cursor'], 'Cursor utilities use cursor-*.'),
  q('What does data-[state=open]:animate-in rely on?', Difficulty.HARD, 'An attribute variant matching data-state="open"', ['A JavaScript variable named state', 'A browser default animation', 'A route parameter'], 'Arbitrary data variants can style elements based on data attributes.'),
];

const jsQuestions: SeedQuestion[] = [
  q('Which keyword declares a block-scoped variable that can be reassigned?', Difficulty.EASY, 'let', ['const', 'var', 'static'], 'let creates a block-scoped binding and allows reassignment.'),
  q('Which keyword declares a block-scoped binding that cannot be reassigned?', Difficulty.EASY, 'const', ['let', 'var', 'mutable'], 'const prevents reassignment of the binding, though object contents can still mutate.'),
  q('What is the result of typeof "hello"?', Difficulty.EASY, 'string', ['text', 'String', 'object'], 'typeof returns lowercase type names such as string, number, and boolean.'),
  q('Which value is falsy?', Difficulty.EASY, '0', ['"0"', '[]', '{}'], '0 is falsy; non-empty strings and objects/arrays are truthy.'),
  q('What does === check?', Difficulty.EASY, 'Strict equality without type coercion', ['Assignment', 'Loose equality with coercion', 'Greater than or equal'], '=== compares value and type without coercing operands.'),
  q('Which method creates a new array by transforming each item?', Difficulty.EASY, 'map', ['push', 'pop', 'includes'], 'map returns a new array of transformed values.'),
  q('Which method keeps only items that match a condition?', Difficulty.EASY, 'filter', ['reduce', 'find', 'slice'], 'filter returns a new array containing matching items.'),
  q('What does reduce commonly do?', Difficulty.MEDIUM, 'Accumulates array values into one result', ['Removes the first item', 'Sorts automatically', 'Finds only booleans'], 'reduce carries an accumulator through each array item.'),
  q('What does an arrow function with expression body return?', Difficulty.MEDIUM, 'The expression value implicitly', ['undefined always', 'A promise always', 'The function name'], 'Expression-body arrow functions return the expression without a return keyword.'),
  q('What is block scope?', Difficulty.MEDIUM, 'Scope limited to a pair of braces', ['Scope shared by all files', 'Only global scope', 'Scope limited to strings'], 'let and const are scoped to the nearest block.'),
  q('Which syntax is a template literal?', Difficulty.EASY, '`Hello ${name}`', ['"Hello ${name}"', "'Hello {name}'", 'template("Hello")'], 'Backticks enable interpolation with ${...}.'),
  q('What does optional chaining do?', Difficulty.MEDIUM, 'Safely reads nested properties that may be null or undefined', ['Forces a property to exist', 'Clones an object', 'Converts to boolean'], '?. stops evaluation and returns undefined when the left side is nullish.'),
  q('What does ?? return when the left side is null or undefined?', Difficulty.MEDIUM, 'The right side', ['false always', 'The left side', 'An error'], 'Nullish coalescing falls back only for null or undefined.'),
  q('Which loop is usually best for values in an array?', Difficulty.EASY, 'for...of', ['for...in', 'switch', 'try...catch'], 'for...of iterates iterable values such as array elements.'),
  q('What does JSON.parse do?', Difficulty.EASY, 'Converts a JSON string into a JavaScript value', ['Converts a value to JSON text', 'Saves to local storage', 'Fetches an API'], 'JSON.parse reads JSON text and returns the represented value.'),
  q('What does JSON.stringify do?', Difficulty.EASY, 'Converts a JavaScript value into JSON text', ['Parses JSON text', 'Adds an event listener', 'Creates a Promise'], 'JSON.stringify serializes values into JSON strings.'),
  q('What does await do inside an async function?', Difficulty.MEDIUM, 'Pauses until a promise settles and returns its fulfillment value', ['Blocks the whole browser thread permanently', 'Creates a new array', 'Declares a variable'], 'await makes async code read sequentially while working with promises.'),
  q('Which block handles thrown errors?', Difficulty.EASY, 'catch', ['then', 'finally only', 'return'], 'try/catch catches exceptions thrown in the try block.'),
  q('What does addEventListener register?', Difficulty.EASY, 'A function to run when an event occurs', ['A CSS class', 'A database trigger', 'A JSON parser'], 'Event listeners respond to browser events like click and input.'),
  q('What does localStorage store?', Difficulty.EASY, 'String key/value pairs in the browser', ['Encrypted server sessions', 'DOM nodes', 'PostgreSQL rows'], 'localStorage persists string data per origin in the browser.'),
];

const htmlCssReactQuestions: SeedQuestion[] = [
  q('Which HTML element represents the main page content?', Difficulty.EASY, 'main', ['section-main', 'content', 'body-main'], 'The main element identifies the dominant content of a document.'),
  q('Which attribute connects a label to an input?', Difficulty.EASY, 'for', ['name', 'target', 'connect'], 'The label for attribute references the input id.'),
  q('Which HTML attribute provides image alternative text?', Difficulty.EASY, 'alt', ['title', 'description', 'aria-image'], 'alt text describes an image for accessibility and fallback.'),
  q('What does semantic HTML improve?', Difficulty.MEDIUM, 'Accessibility, structure, and machine readability', ['Only color palettes', 'Only JavaScript speed', 'Only database queries'], 'Semantic elements communicate meaning to browsers and assistive tech.'),
  q('Which CSS property controls foreground text color?', Difficulty.EASY, 'color', ['background', 'font-color', 'text-fill-only'], 'The color property sets text and foreground color.'),
  q('Which CSS layout model is one-dimensional?', Difficulty.EASY, 'Flexbox', ['Grid', 'Multicolumn only', 'Canvas'], 'Flexbox primarily lays out items along one axis.'),
  q('Which CSS layout model is two-dimensional?', Difficulty.EASY, 'Grid', ['Inline', 'Float only', 'Text transform'], 'CSS Grid handles rows and columns together.'),
  q('What does box-sizing: border-box do?', Difficulty.MEDIUM, 'Includes padding and border inside declared width/height', ['Removes margins', 'Centers content', 'Disables borders'], 'border-box makes sizing more predictable.'),
  q('What does a React component return?', Difficulty.EASY, 'UI description, usually JSX', ['SQL rows', 'A CSS file only', 'A browser event'], 'React components describe UI using JSX or React elements.'),
  q('What does useState provide?', Difficulty.EASY, 'A state value and setter', ['A router', 'A database connection', 'A CSS compiler'], 'useState manages local component state.'),
  q('When should useEffect cleanup run?', Difficulty.MEDIUM, 'Before rerun and when the component unmounts', ['Only after build', 'Only on server restart', 'Never'], 'Effect cleanup prevents leaks such as dangling intervals.'),
  q('Why should list items have stable keys?', Difficulty.MEDIUM, 'To help React match items during rendering', ['To style text bold', 'To encrypt IDs', 'To fetch data'], 'Keys help React preserve identity across list changes.'),
  q('What does TypeScript add to JavaScript?', Difficulty.EASY, 'Static type checking', ['A new browser runtime', 'Built-in SQL', 'Automatic CSS'], 'TypeScript checks types at development/build time.'),
  q('Which TypeScript type represents true or false?', Difficulty.EASY, 'boolean', ['bool', 'truth', 'binary'], 'The primitive type is boolean.'),
  q('What is an interface useful for?', Difficulty.EASY, 'Describing object shapes', ['Running HTTP requests', 'Styling hover states', 'Starting servers'], 'Interfaces define expected object properties.'),
  q('What does fetch usually return?', Difficulty.MEDIUM, 'A Promise for a Response', ['Plain JSON immediately', 'A DOM node', 'A database row'], 'fetch is asynchronous and resolves to a Response object.'),
  q('What does REST commonly model resources with?', Difficulty.EASY, 'URLs and HTTP methods', ['CSS classes', 'Git branches only', 'HTML forms only'], 'REST APIs typically expose resources at URLs and use methods like GET and POST.'),
  q('Which HTTP status usually means unauthorized?', Difficulty.EASY, '401', ['200', '404', '500'], '401 indicates authentication is missing or invalid.'),
  q('Which SQL statement reads rows?', Difficulty.EASY, 'SELECT', ['INSERT', 'UPDATE', 'DROP'], 'SELECT queries data from tables.'),
  q('What is a primary key?', Difficulty.EASY, 'A unique row identifier', ['A password', 'A CSS variable', 'A React prop'], 'Primary keys uniquely identify table rows.'),
  q('What does git commit create?', Difficulty.EASY, 'A snapshot of staged changes', ['A remote repository automatically', 'A database backup', 'A package install'], 'A commit records staged changes in Git history.'),
  q('What does git pull usually do?', Difficulty.MEDIUM, 'Fetches remote changes and integrates them', ['Deletes local files', 'Creates a CSS bundle', 'Runs tests only'], 'git pull is fetch plus integration, typically merge or rebase.'),
];

const buildQuiz = (title: string, category: string, difficulty: Difficulty, timeLimit: number, source: SeedQuestion[], offset: number): SeedQuiz => ({
  title,
  category,
  difficulty,
  timeLimit,
  description: `${title} checks practical understanding with scenario-based questions and clear explanations after submission.`,
  questions: Array.from({ length: 20 }, (_, index) => source[(offset + index) % source.length]),
});

const quizzes: SeedQuiz[] = [
  buildQuiz('Tailwind CSS Fundamentals', 'Tailwind CSS', Difficulty.EASY, 25, tailwindCore, 0),
  buildQuiz('Tailwind CSS Responsive Design', 'Tailwind CSS', Difficulty.MEDIUM, 30, tailwindResponsive, 0),
  buildQuiz('Tailwind CSS Flexbox & Grid', 'Tailwind CSS', Difficulty.MEDIUM, 30, tailwindLayout, 0),
  buildQuiz('Tailwind CSS Typography', 'Tailwind CSS', Difficulty.EASY, 25, tailwindTypography, 0),
  buildQuiz('Tailwind CSS Positioning', 'Tailwind CSS', Difficulty.MEDIUM, 30, tailwindPosition, 0),
  buildQuiz('Tailwind CSS Transforms & Animations', 'Tailwind CSS', Difficulty.MEDIUM, 30, tailwindEffects, 0),
  buildQuiz('Tailwind CSS Advanced Utilities', 'Tailwind CSS', Difficulty.HARD, 35, tailwindAdvanced, 0),
  buildQuiz('Tailwind CSS Layout Challenge', 'Tailwind CSS', Difficulty.HARD, 35, [...tailwindResponsive, ...tailwindLayout], 5),
  buildQuiz('Tailwind CSS Interaction States', 'Tailwind CSS', Difficulty.MEDIUM, 30, [...tailwindEffects, ...tailwindAdvanced], 4),
  buildQuiz('Tailwind CSS Mastery', 'Tailwind CSS', Difficulty.HARD, 40, [...tailwindCore, ...tailwindResponsive, ...tailwindLayout, ...tailwindTypography, ...tailwindPosition, ...tailwindEffects, ...tailwindAdvanced], 12),
  buildQuiz('JavaScript Fundamentals', 'JavaScript Basics', Difficulty.EASY, 25, jsQuestions, 0),
  buildQuiz('JavaScript Arrays & Objects', 'JavaScript Basics', Difficulty.MEDIUM, 30, jsQuestions, 5),
  buildQuiz('JavaScript Functions & Scope', 'JavaScript Basics', Difficulty.MEDIUM, 30, jsQuestions, 8),
  buildQuiz('JavaScript Control Flow', 'JavaScript Basics', Difficulty.EASY, 25, jsQuestions, 2),
  buildQuiz('JavaScript Modern Syntax', 'JavaScript Basics', Difficulty.MEDIUM, 30, jsQuestions, 10),
  buildQuiz('JavaScript Basics Challenge', 'JavaScript Basics', Difficulty.HARD, 35, jsQuestions, 0),
  buildQuiz('HTML Fundamentals', 'HTML Basics', Difficulty.EASY, 20, htmlCssReactQuestions, 0),
  buildQuiz('CSS Fundamentals', 'CSS Basics', Difficulty.EASY, 20, htmlCssReactQuestions, 4),
  buildQuiz('TypeScript Fundamentals', 'TypeScript Basics', Difficulty.MEDIUM, 25, htmlCssReactQuestions, 12),
  buildQuiz('React Fundamentals', 'React Basics', Difficulty.MEDIUM, 25, htmlCssReactQuestions, 8),
  buildQuiz('HTTP & REST Basics', 'HTTP & REST API Basics', Difficulty.EASY, 20, htmlCssReactQuestions, 15),
  buildQuiz('SQL/PostgreSQL Fundamentals', 'SQL/PostgreSQL Basics', Difficulty.EASY, 20, htmlCssReactQuestions, 18),
  buildQuiz('Git & GitHub Fundamentals', 'Git & GitHub Basics', Difficulty.EASY, 20, htmlCssReactQuestions, 20),
  buildQuiz('Web Development Fundamentals', 'Web Development Fundamentals', Difficulty.EASY, 25, htmlCssReactQuestions, 0),
];

const users = [
  { name: 'Admin User', email: 'admin@quizforge.local', role: UserRole.ADMIN },
  { name: 'Ava Stone', email: 'ava@quizforge.local', role: UserRole.USER },
  { name: 'Noah Reed', email: 'noah@quizforge.local', role: UserRole.USER },
  { name: 'Maya Chen', email: 'maya@quizforge.local', role: UserRole.USER },
  { name: 'Leo Brooks', email: 'leo@quizforge.local', role: UserRole.USER },
  { name: 'Sara Kim', email: 'sara@quizforge.local', role: UserRole.USER },
  { name: 'Omar Lane', email: 'omar@quizforge.local', role: UserRole.USER },
  { name: 'Priya Shah', email: 'priya@quizforge.local', role: UserRole.USER },
];

async function seed() {
  await dataSource.initialize();

  try {
    await dataSource.transaction(async manager => {
      const userRepo = manager.getRepository(User);
      const quizRepo = manager.getRepository(Quiz);
      const questionRepo = manager.getRepository(Question);
      const answerRepo = manager.getRepository(Answer);
      const attemptRepo = manager.getRepository(QuizAttempt);
      const attemptAnswerRepo = manager.getRepository(AttemptAnswer);

      const password = await argon2.hash('Password123!');

      const savedUsers: User[] = [];
      for (const seedUser of users) {
        let user = await userRepo.findOne({ where: { email: seedUser.email } });
        if (!user) {
          user = userRepo.create({ ...seedUser, password });
        } else {
          user.name = seedUser.name;
          user.role = seedUser.role;
          user.password = password;
        }
        savedUsers.push(await userRepo.save(user));
      }

      const existingSeedQuizzes = await quizRepo.find({
        where: { title: In(quizzes.map(item => item.title)) },
        relations: { questions: { answers: true }, attempts: true },
      });

      for (const existing of existingSeedQuizzes) {
        await attemptRepo.delete({ quiz: { id: existing.id } });
        await quizRepo.remove(existing);
      }

      const savedQuizzes: Quiz[] = [];
      for (const seedQuiz of quizzes) {
        const quiz = await quizRepo.save(
          quizRepo.create({
            title: seedQuiz.title,
            description: seedQuiz.description,
            category: seedQuiz.category,
            difficulty: seedQuiz.difficulty,
            timeLimit: seedQuiz.timeLimit,
          }),
        );

        for (const seedQuestion of seedQuiz.questions) {
          const question = await questionRepo.save(
            questionRepo.create({
              questionText: seedQuestion.questionText,
              difficulty: seedQuestion.difficulty,
              points: seedQuestion.points,
              explanation: seedQuestion.explanation,
              quiz,
            }),
          );

          for (const [index, answerText] of seedQuestion.answers.entries()) {
            await answerRepo.save(
              answerRepo.create({
                answerText,
                isCorrect: index === seedQuestion.correctIndex,
                question,
              }),
            );
          }
        }

        savedQuizzes.push(quiz);
      }

      const learnerUsers = savedUsers.filter(user => user.role !== UserRole.ADMIN);
      const quizDetails = await quizRepo.find({
        where: { id: In(savedQuizzes.map(quiz => quiz.id)) },
        relations: { questions: { answers: true } },
      });

      for (const [userIndex, user] of learnerUsers.entries()) {
        for (const [quizIndex, quiz] of quizDetails.entries()) {
          if ((userIndex + quizIndex) % 3 === 0) {
            continue;
          }

          const attempt = attemptRepo.create({
            user,
            quiz,
            score: 0,
            totalPoints: 0,
            percentage: 0,
            correctAnswers: 0,
            wrongAnswers: 0,
            totalQuestions: quiz.questions.length,
            answeredQuestions: 0,
            incorrectAnswers: 0,
            unansweredQuestions: 0,
            completedAt: new Date(Date.now() - (userIndex * 13 + quizIndex) * 60 * 60 * 1000),
          });

          const savedAttempt = await attemptRepo.save(attempt);
          let score = 0;
          let totalPoints = 0;
          let correctAnswers = 0;
          let wrongAnswers = 0;

          for (const [questionIndex, question] of quiz.questions.entries()) {
            totalPoints += question.points;
            const correctAnswer = question.answers.find(answer => answer.isCorrect)!;
            const wrongAnswer = question.answers.find(answer => !answer.isCorrect)!;
            const chooseCorrect = (userIndex * 5 + quizIndex * 3 + questionIndex) % 10 < 5 + (userIndex % 4);
            const selectedAnswer = chooseCorrect ? correctAnswer : wrongAnswer;
            const isCorrect = selectedAnswer.isCorrect;
            const pointsEarned = isCorrect ? question.points : 0;

            if (isCorrect) {
              score += pointsEarned;
              correctAnswers++;
            } else {
              wrongAnswers++;
            }

            await attemptAnswerRepo.save(
              attemptAnswerRepo.create({
                attempt: savedAttempt,
                question,
                selectedAnswer,
                isCorrect,
                pointsEarned,
              }),
            );
          }

          savedAttempt.score = score;
          savedAttempt.totalPoints = totalPoints;
          savedAttempt.percentage = Number(((score / totalPoints) * 100).toFixed(2));
          savedAttempt.correctAnswers = correctAnswers;
          savedAttempt.wrongAnswers = wrongAnswers;
          savedAttempt.totalQuestions = quiz.questions.length;
          savedAttempt.answeredQuestions = quiz.questions.length;
          savedAttempt.incorrectAnswers = wrongAnswers;
          savedAttempt.unansweredQuestions = 0;
          await attemptRepo.save(savedAttempt);
        }
      }
    });

    const [userCount, quizCount, questionCount, answerCount, attemptCount] = await Promise.all([
      dataSource.getRepository(User).count(),
      dataSource.getRepository(Quiz).count(),
      dataSource.getRepository(Question).count(),
      dataSource.getRepository(Answer).count(),
      dataSource.getRepository(QuizAttempt).count(),
    ]);

    console.log(JSON.stringify({ userCount, quizCount, questionCount, answerCount, attemptCount }, null, 2));
  } finally {
    await dataSource.destroy();
  }
}

seed().catch(error => {
  console.error(error);
  process.exit(1);
});
