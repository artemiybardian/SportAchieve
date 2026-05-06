import {Section} from "@/components/ui/Section.tsx";
import {Heading, SoraText} from "@/components/ui/Typography.tsx";
import {Chip, ChipGroup} from "@/components/ui/Chip.tsx";
import ExerciseMachineProps from "@/components/ui/ExerciseMachineCard/ExerciseMachineProps.ts";


function ExerciseMachineCard({title, description, image, muscles}: ExerciseMachineProps) {
    return <Section padding="32px">
        {image ? <div style={{display: "flex", alignItems: "center", flexDirection: "column", width: "100%"}}>
            <img width="280px" src={image} alt=""/>
        </div> : undefined}
        <Heading style={{marginTop: "18px"}}>{title}</Heading>
        <ChipGroup style={{marginTop: "4px"}}>
            {muscles.map((muscle, index) => (<Chip key={index}>{muscle}</Chip>))}
        </ChipGroup>
        <SoraText style={{marginTop: "16px"}}>{description}</SoraText>
    </Section>
}

export default ExerciseMachineCard;
