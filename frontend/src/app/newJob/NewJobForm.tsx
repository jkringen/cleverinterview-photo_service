'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Flex, Button, TextField, TextArea, Select, Separator, Card } from '@radix-ui/themes';
import PrimaryText from '../components/PrimaryText';
import { JobType } from '../types';
import { getJobQueryAuthHeaders, pairsToObject } from '../utils';
import { useRouter } from 'next/navigation';
import { JOBS_API } from '../constants';

/**
 * Props interface for this component.
 */
interface Props {
  jobs: JobType[];
  apiToken: string;
}

/**
 * Zod object validation config for key/value pairs in parameters data.
 */
const parametersPair = z.object({
  key: z.string().trim().min(1, 'Key is required'),
  value: z.string().trim().min(1, 'Value is required'),
});

/**
 * Builds Zod schema from allowed Job IDs so we can validate before submitting.
 * @param {number[]} allowedIds Array of allowed Job ID numbers
 * @returns {z.ZodObject}
 */
function makeSchema(allowedIds: number[]) {
  return z.object({
    jobTypeId: z
      .string()
      .min(1, 'Job Type is required')
      .refine((s) => /^\d+$/.test(s), { message: 'Invalid Job Type' })
      .refine((s) => allowedIds.includes(Number(s)), { message: 'Select a valid Job Type' }),
    parameters: z.array(parametersPair).min(1, 'At least one parameter is required'),
    notes: z.string().max(255).optional(),
  });
}

/**
 * Inferred type of our schema for the useForm hook type parameter.
 */
type FormValues = z.infer<ReturnType<typeof makeSchema>>;

/**
 * Renders a form for submitting a new Job to the system.
 * @param {Props} props Incoming props
 */
export function NewJobForm({ jobs, apiToken }: Props) {
  const router = useRouter();
  // protect against null jobs list
  jobs = jobs && Array.isArray(jobs) ? jobs : [];

  /**
   * Calculated list of allowed values for the Job Type dropdown
   */
  const allowedIds: number[] = React.useMemo(() => jobs.map((j) => j.id), [jobs]);

  /**
   * ZOD schema instance for form validation
   */
  const formSchema = React.useMemo(() => makeSchema(allowedIds), [allowedIds]);

  // setup reach hook form with ZOD resolved, etc.
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobTypeId: '',
      parameters: [{ key: '', value: '' }],
      notes: '',
    },
    mode: 'onSubmit',
  });

  // mark parameters as a field array, allowing data to be added / removed, etc.
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'parameters',
  });

  /**
   * Submits form data to the backend API. Sends data as a POST with
   * JSON data in the body pauyload instead of a form data submission.
   * @param values
   * @returns
   */
  const onSubmit = async (values: FormValues) => {
    // construct payload for new job
    const payload = {
      job_id: values.jobTypeId,
      parameters: pairsToObject(values.parameters),
      notes: values.notes ?? null,
    };

    // make post to backend
    const res = await fetch(JOBS_API, {
      method: 'POST',
      headers: getJobQueryAuthHeaders(apiToken),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      // push to submit error popup
      router.push('/newJob/error');
      return;
    }

    // push to submitted confirmation popup
    router.push('/newJob/submitted');
  };

  return (
    <Card variant="classic" size="5" style={{ minWidth: '450px' }}>
      <Box asChild>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Flex direction="column" gap="5">
            <Box>
              <PrimaryText as="div" weight="bold">
                Submit New Job
              </PrimaryText>
              <PrimaryText as="div" size="3" color="gray">
                Choose a job type, add parameters, and (optionally) notes.
              </PrimaryText>
            </Box>

            <Separator size="4" />

            <Box>
              <Flex direction="column" gap="2">
                <PrimaryText as="label" weight="medium">
                  Job Type <PrimaryText color="red">*</PrimaryText>
                </PrimaryText>
                <Controller
                  name="jobTypeId"
                  control={control}
                  render={({ field }) => (
                    <Select.Root value={field.value} onValueChange={field.onChange}>
                      <Select.Trigger placeholder="Select a job type…" />
                      <Select.Content>
                        {jobs.map((job) => (
                          <Select.Item key={job.id} value={String(job.id)}>
                            {job.title} {/* what the user sees */}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                  )}
                />
                {errors.jobTypeId && (
                  <PrimaryText size="3" color="red">
                    {errors.jobTypeId.message}
                  </PrimaryText>
                )}
              </Flex>
            </Box>

            {/* Parameters: (dynamic key/value rows) */}
            <Box>
              <Flex direction="column" gap="3">
                <PrimaryText as="div" weight="medium">
                  Parameters <PrimaryText color="red">*</PrimaryText>
                </PrimaryText>

                <Flex direction="column" gap="3">
                  {fields.map((field, index) => (
                    <Flex key={field.id} gap="3" align="center" wrap="wrap">
                      <Box style={{ flexGrow: 1, minWidth: 200 }}>
                        <PrimaryText size="3" as="label" color="gray">
                          Key
                        </PrimaryText>
                        <TextField.Root
                          placeholder="e.g. source_bucket"
                          {...register(`parameters.${index}.key` as const)}
                        />
                        {errors.parameters?.[index]?.key && (
                          <PrimaryText size="3" color="red">
                            {errors.parameters[index]!.key!.message}
                          </PrimaryText>
                        )}
                      </Box>

                      <Box style={{ flexGrow: 1, minWidth: 200 }}>
                        <PrimaryText size="3" as="label" color="gray">
                          Value
                        </PrimaryText>
                        <TextField.Root
                          placeholder="e.g. uploads-01"
                          {...register(`parameters.${index}.value` as const)}
                        />
                        {errors.parameters?.[index]?.value && (
                          <PrimaryText size="3" color="red">
                            {errors.parameters[index]!.value!.message}
                          </PrimaryText>
                        )}
                      </Box>
                    </Flex>
                  ))}
                </Flex>

                <Flex gap="3">
                  <Button type="button" variant="surface" onClick={() => append({ key: '', value: '' })}>
                    Add parameter
                  </Button>
                  <Button
                    type="button"
                    variant="soft"
                    onClick={() => remove(fields.length - 1)}
                    disabled={fields.length === 1}
                  >
                    Remove
                  </Button>
                </Flex>

                {errors.parameters && !Array.isArray(errors.parameters) && (
                  <PrimaryText size="3" color="red">
                    {errors.parameters.message as string}
                  </PrimaryText>
                )}
              </Flex>
            </Box>

            <Box>
              <Flex direction="column" gap="2">
                <PrimaryText as="label" weight="medium">
                  Notes
                </PrimaryText>
                <TextArea
                  maxLength={255}
                  placeholder="Optional notes about this job…"
                  rows={5}
                  {...register('notes')}
                />
                {errors.notes && (
                  <PrimaryText size="3" color="red">
                    {errors.notes.message}
                  </PrimaryText>
                )}
              </Flex>
            </Box>

            <Separator size="4" />

            <Flex gap="3" justify="start">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting…' : 'Submit Job'}
              </Button>
            </Flex>
          </Flex>
        </form>
      </Box>
    </Card>
  );
}
